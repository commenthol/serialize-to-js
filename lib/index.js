/*
 * @copyright 2016 commenthol
 * @license MIT
 */
/* eslint no-new-func: 0 */

'use strict'

// dependencies
var util = require('mergee').util
var safeString = require('./utils').safeString
var Ref = require('./reference')

/**
 * serializes an object to javascript
 *
 * #### Example - serializing regex, date, buffer, ...
 *
 * ```js
 * var serialize = require('serialize-to-js').serialize;
 * var obj = {
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
 * }
 * console.log(serialize(obj))
 * // > {str: "\u003Cscript\u003Evar a = 0 \u003E 1\u003C\u002Fscript\u003E", num: 3.1415, bool: true, nil: null, undef: undefined, obj: {foo: "bar"}, arr: [1, "2"], regexp: /^test?$/, date: new Date("2016-04-15T16:22:52.009Z"), buffer: new Buffer('ZGF0YQ==', 'base64')}
 * ```
 *
 * #### Example - serializing while respecting references
 *
 * ```js
 * var serialize = require('serialize-to-js').serialize;
 * var obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * var opts = { reference: true };
 * console.log(serialize(obj, opts));
 * //> {object: {regexp: /^test?$/}}
 * console.log(opts.references);
 * //> [ [ 'reference', 'object' ] ]
 * ```
 *
 * @param {Object|Array|Function|Any} source - source to serialize
 * @param {Object} [opts] - options
 * @param {Boolean} opts.ignoreCircular - ignore circular objects
 * @param {Boolean} opts.reference - reference instead of a copy (requires post-processing of opts.references)
 * @return {String} serialized representation of `source`
 */
function serialize (source, opts) {
  var out = ''
  var key
  var tmp

  opts = opts || {}
  if (!opts._visited) {
    opts._visited = []
  }
  if (!opts._refs) {
    opts.references = []
    opts._refs = new Ref(opts.references)
  }

  if (util.isArray(source)) {
    tmp = []
    source.forEach(function (item) {
      tmp.push(serialize(item, opts))
    })
    out += '[' + tmp.join(', ') + ']'
  } else if (util.isFunction(source)) {
    out += source.toString()
  } else if (util.isObject(source)) {
    if (util.isNull(source)) {
      out += 'null'
    } else if (util.isRegExp(source)) {
      out += source.toString()
    } else if (util.isDate(source)) {
      out += 'new Date("' + source.toJSON() + '")'
    } else if (util.isError(source)) {
      out += 'new Error(' + (source.message ? '"' + source.message + '"' : '') + ')'
    } else if (util.isBuffer(source)) {
      out += "new Buffer('" + source.toString('base64') + "', 'base64')"
    } else {
      tmp = []
      // copy properties if not circular
      if (!~opts._visited.indexOf(source)) {
        opts._visited.push(source)
        for (key in source) {
          if (source.hasOwnProperty(key)) {
            if (opts.reference && util.isObject(source[key])) {
              opts._refs.push(key)
              if (!opts._refs.hasReference(source[key])) {
                tmp.push(Ref.wrapkey(key) + ': ' + serialize(source[key], opts))
              }
              opts._refs.pop()
            } else {
              tmp.push(Ref.wrapkey(key) + ': ' + serialize(source[key], opts))
            }
          }
        }
        out += '{' + tmp.join(', ') + '}'
        opts._visited.pop()
      } else {
        if (!opts.ignoreCircular) {
          throw new Error('can not convert circular structures.')
        }
      }
    }
  } else if (util.isString(source)) {
    out += '"' + safeString(source) + '"'
  } else {
    out += '' + source
  }
  return out
}
exports.serialize = serialize

/**
 * deserialize a serialized object to javascript
 *
 * #### Example - serializing regex, date, buffer, ...
 *
 * ```js
 * var str = '{obj: {foo: "bar"}, arr: [1, "2"], regexp: /^test?$/, date: new Date("2016-04-15T16:22:52.009Z")}'
 * var res = deserialize(str)
 * console.log(res)
 * //> { obj: { foo: 'bar' },
 * //>   arr: [ 1, '2' ],
 * //>   regexp: /^test?$/,
 * //>   date: Sat Apr 16 2016 01:22:52 GMT+0900 (JST) }
 * ```
 *
 * @param {String} str - string containing serilaized data
 * @return {Any} deserialized data
 */
function deserialize (str) {
  return (new Function('return ' + str))()
}
exports.deserialize = deserialize

/**
 * serialize to a module which can be `require`ed.
 *
 * #### Example - serializing while respecting references
 *
 * ```js
 * var serialTM = require('serialize-to-js').serializeToModule;
 * var obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * console.log(serialTM(obj, { reference: true }));
 * //> var m = module.exports = {
 * //> 	object: {
 * //> 		regexp: /^test?$/
 * //> 	}
 * //> };
 * //> m.reference = m.object;
 * ```
 *
 * @param {Object|Array|Function|Any} source - source to serialize
 * @param {Object} [opts] - options
 * @param {Boolean} opts.ignoreCircular - ignore circular objects
 * @param {Boolean} opts.reference - reference instead of a copy (requires post-processing of opts.references)
 * @param {Boolean} opts.comment - add a comments - useful for linting tools e.g. using 'eslint-disable'
 * @param {Boolean|Object} opts.beautify - beautify output - default is `false`. If Object then use je-beautify options.
 * @return {String} serialized representation of `source` as module
 */
function serializeToModule (source, opts) {
  opts = opts || {}
  var out = ''
  if (opts.reference) {
    opts.references = []
  }
  if (opts.comment) {
    out = '/* ' + opts.comment + ' */\n'
  }
  out += 'var m = module.exports = ' + serialize(source, opts) + ';\n'
  if (opts.references) {
    opts.references.forEach(function (i) {
      out += 'm' + i[0] + ' = m' + i[1] + ';\n'
    })
  }
  if (opts.beautify !== false) {
    var beautify = require('js-beautify').js_beautify
    if (typeof opts.beautify !== 'object') {
      opts.beautify = {
        indent_size: 1,
        indent_char: '\t'
      }
    }
    out = beautify(out, opts.beautify)
  }

  return out
}
exports.serializeToModule = serializeToModule
