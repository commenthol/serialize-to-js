'use strict';

const UNSAFE_CHARS_REGEXP = /[<>\u2028\u2029/\\\r\n\t"]/g;
const CHARS_REGEXP = /[\\\r\n\t"]/g;

const UNICODE_CHARS = {
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\\': '\\u005C',
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
};

function safeString(str) {
  return str.replace(UNSAFE_CHARS_REGEXP, unsafeChar => {
    return UNICODE_CHARS[unsafeChar]
  })
}

function unsafeString(str) {
  str = str.replace(CHARS_REGEXP, unsafeChar => UNICODE_CHARS[unsafeChar]);
  return str
}

function quote(str, opts) {
  const fn = opts.unsafe ? unsafeString : safeString;
  return str ? `"${fn(str)}"` : ''
}

function saferFunctionString(str, opts) {
  return opts.unsafe
    ? str
    : str.replace(/(<\/?)([a-z][^>]*?>)/gi, (m, m1, m2) => safeString(m1) + m2)
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null
}

function isBuffer(arg) {
  return arg instanceof Buffer
}

function isInvalidDate(arg) {
  return isNaN(arg.getTime())
}

function toType(o) {
  const _type = Object.prototype.toString.call(o);
  const type = _type.substring(8, _type.length - 1);
  if (type === 'Uint8Array' && isBuffer(o)) return 'Buffer'
  return type
}

/*
 * @copyright 2015- commenthol
 * @license MIT
 */


const KEY = /^[a-zA-Z$_][a-zA-Z$_0-9]*$/;

/**
 * handle references
 * @constructor
 * @param {Object} references
 * @param {boolean} opts.unsafe
 */
function Ref(references, opts) {
  this.keys = [];
  this.refs = [];
  this.key = [];
  this.references = references || [];
  this._opts = opts || {};
}

/**
 * wrap an object key
 * @api private
 * @param {String} key - objects key
 * @return {String} wrapped key in quotes if necessary
 */
Ref.wrapkey = function (key, opts) {
  return KEY.test(key) ? key : quote(key, opts)
};

Ref.prototype = {
  /**
   * push `key` to interal array
   * @param {String} key
   */
  push: function (key) {
    this.key.push(key);
  },
  /**
   * remove the last key from internal array
   */
  pop: function () {
    this.key.pop();
  },
  /**
   * join the keys
   */
  join: function (key) {
    let out = '';
    key = key || this.key;
    if (typeof key === 'string') {
      key = [key];
    }

    key.forEach(k => {
      if (KEY.test(k)) {
        out += '.' + k;
      } else {
        out += '[' + Ref.wrapkey(k, this._opts) + ']';
      }
    });
    return out
  },
  /**
   * check if object `source` has an already known reference.
   * If so then origin and source are stored in `opts.reference`
   * @param {Object} source - object to compare
   * @return {Boolean}
   */
  hasReference: function (source) {
    let idx;
    if (~(idx = this.refs.indexOf(source))) {
      this.references.push([this.join(), this.keys[idx]]);
      return true
    } else {
      this.refs.push(source);
      this.keys.push(this.join());
    }
  },
  /**
   * get the references array
   * @return {Array} references array
   */
  getReferences: function () {
    return this.references
  }
};

/*
 * @copyright 2016- commenthol
 * @license MIT
 */


/**
 * serializes an object to javascript
 *
 * @example <caption>serializing regex, date, buffer, ...</caption>
 * const serialize = require('serialize-to-js')
 * const obj = {
 *   str: '<script>var a = 0 > 1</script>',
 *   num: 3.1415,
 *   bool: true,
 *   nil: null,
 *   undef: undefined,
 *   obj: { foo: 'bar' },
 *   arr: [1, '2'],
 *   regexp: /^test?$/,
 *   date: new Date(),
 *   buffer: new Buffer('data'),
 *   set: new Set([1, 2, 3]),
 *   map: new Map([['a': 1],['b': 2]])
 * }
 * console.log(serialize(obj))
 * //> '{str: "\u003Cscript\u003Evar a = 0 \u003E 1\u003C\u002Fscript\u003E",
 * //>   num: 3.1415, bool: true, nil: null, undef: undefined,
 * //>   obj: {foo: "bar"}, arr: [1, "2"], regexp: new RegExp("^test?$", ""),
 * //>   date: new Date("2019-12-29T10:37:36.613Z"),
 * //>   buffer: Buffer.from("ZGF0YQ==", "base64"), set: new Set([1, 2, 3]),
 * //>   map: new Map([["a", 1], ["b", 2]])}'
 *
 * @example <caption>serializing while respecting references</caption>
 * const serialize = require('serialize-to-js')
 * const obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * const opts = { reference: true };
 * console.log(serialize(obj, opts));
 * //> {object: {regexp: /^test?$/}}
 * console.log(opts.references);
 * //> [ [ '.reference', '.object' ] ]
 *
 * @param {unknown} source - source to serialize
 * @param {Object} [opts] - options
 * @param {boolean} [opts.ignoreCircular] - ignore circular objects
 * @param {boolean} [opts.reference] - reference instead of a copy (requires post-processing of opts.references)
 * @param {boolean} [opts.unsafe] - do not escape chars `<>/`
 * @param {Array<[string, string]>} [opts.references] - populated with references when `reference` is enabled
 * @return {string} serialized representation of `source`
 */
function serialize(source, opts = {}) {
  opts = opts || {};

  const visited = new Set();
  opts.references = [];
  const refs = new Ref(opts.references, opts);

  function stringify(source, opts) {
    const type = toType(source);

    if (visited.has(source)) {
      if (opts.ignoreCircular) {
        switch (type) {
          case 'Array':
            return '[/*[Circular]*/]'
          case 'Object':
            return '{/*[Circular]*/}'
          default:
            return 'undefined /*[Circular]*/'
        }
      } else {
        throw new Error('can not convert circular structures.')
      }
    }

    switch (type) {
      case 'Null':
        return 'null'
      case 'String':
        return quote(source, opts) || '""'
      case 'Function': {
        const _tmp = Function.prototype.toString.call(source);
        const tmp = opts.unsafe ? _tmp : saferFunctionString(_tmp, opts);
        // append function to es6 function within obj
        return !/^\s*(function|\([^)]*?\)\s*=>)/m.test(tmp)
          ? 'function ' + tmp
          : tmp
      }
      case 'RegExp':
        return `new RegExp(${quote(source.source, opts)}, "${source.flags}")`
      case 'Date':
        if (isInvalidDate(source)) return 'new Date("Invalid Date")'
        return `new Date(${quote(source.toJSON(), opts)})`
      case 'Error':
        return `new Error(${quote(source.message, opts)})`
      case 'Buffer':
        return `Buffer.from("${source.toString('base64')}", "base64")`
      case 'Array': {
        visited.add(source);
        const tmp = source.map(item => stringify(item, opts));
        visited.delete(source);
        return `[${tmp.join(', ')}]`
      }
      case 'Int8Array':
      case 'Uint8Array':
      case 'Uint8ClampedArray':
      case 'Int16Array':
      case 'Uint16Array':
      case 'Int32Array':
      case 'Uint32Array':
      case 'Float32Array':
      case 'Float64Array': {
        const tmp = [];
        for (let i = 0; i < source.length; i++) {
          tmp.push(source[i]);
        }
        return `new ${type}([${tmp.join(', ')}])`
      }
      case 'Set': {
        visited.add(source);
        const tmp = Array.from(source).map(item => stringify(item, opts));
        visited.delete(source);
        return `new ${type}([${tmp.join(', ')}])`
      }
      case 'Map': {
        visited.add(source);
        const tmp = Array.from(source).map(
          ([key, value]) =>
            `[${stringify(key, opts)}, ${stringify(value, opts)}]`
        );
        visited.delete(source);
        return `new ${type}([${tmp.join(', ')}])`
      }
      case 'Object': {
        visited.add(source);
        const tmp = [];
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (opts.reference && isObject(source[key])) {
              refs.push(key);
              if (!refs.hasReference(source[key])) {
                tmp.push(
                  Ref.wrapkey(key, opts) + ': ' + stringify(source[key], opts)
                );
              }
              refs.pop();
            } else {
              tmp.push(
                Ref.wrapkey(key, opts) + ': ' + stringify(source[key], opts)
              );
            }
          }
        }
        visited.delete(source);
        return `{${tmp.join(', ')}}`
      }
      default:
        return '' + source
    }
  }

  return stringify(source, opts)
}

module.exports = serialize;
