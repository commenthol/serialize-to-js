/*
 * @copyright 2016- commenthol
 * @license MIT
 */

'use strict'

// dependencies
const utils = require('./internal/utils')
const Ref = require('./internal/reference')

/**
 * serializes an object to javascript
 *
 * @example <caption>serializing regex, date, buffer, ...</caption>
 * const serialize = require('serialize-to-js').serialize;
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
 * }
 * console.log(serialize(obj))
 * // > {str: "\u003Cscript\u003Evar a = 0 \u003E 1\u003C\u002Fscript\u003E", num: 3.1415, bool: true, nil: null, undef: undefined, obj: {foo: "bar"}, arr: [1, "2"], regexp: /^test?$/, date: new Date("2016-04-15T16:22:52.009Z"), buffer: new Buffer('ZGF0YQ==', 'base64')}
 *
 * @example <caption>serializing while respecting references</caption>
 * const serialize = require('serialize-to-js').serialize;
 * const obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * const opts = { reference: true };
 * console.log(serialize(obj, opts));
 * //> {object: {regexp: /^test?$/}}
 * console.log(opts.references);
 * //> [ [ '.reference', '.object' ] ]
 *
 * @param {Object|Array|Function|Any} source - source to serialize
 * @param {Object} [opts] - options
 * @param {Boolean} opts.ignoreCircular - ignore circular objects
 * @param {Boolean} opts.reference - reference instead of a copy (requires post-processing of opts.references)
 * @param {Boolean} opts.unsafe - do not escape chars `<>/`
 * @return {String} serialized representation of `source`
 */
function serialize (source, opts) {
  let type

  opts = opts || {}
  if (!opts._visited) {
    opts._visited = []
  }
  if (!opts._refs) {
    opts.references = []
    opts._refs = new Ref(opts.references, opts)
  }

  if (utils.isNull(source)) {
    return 'null'
  } else if (Array.isArray(source)) {
    const tmp = source.map(item => serialize(item, opts))
    return `[${tmp.join(', ')}]`
  } else if (utils.isFunction(source)) {
    // serializes functions only in unsafe mode!
    const _tmp = source.toString()
    const tmp = opts.unsafe ? _tmp : utils.saferFunctionString(_tmp, opts)
    // append function to es6 function within obj
    return !/^\s*(function|\([^)]*?\)\s*=>)/m.test(tmp) ? 'function ' + tmp : tmp
  } else if (utils.isObject(source)) {
    if (utils.isRegExp(source)) {
      return `new RegExp(${utils.quote(source.source, opts)}, "${source.flags}")`
    } else if (utils.isDate(source)) {
      return `new Date(${utils.quote(source.toJSON(), opts)})`
    } else if (utils.isError(source)) {
      return `new Error(${utils.quote(source.message, opts)})`
    } else if (utils.isBuffer(source)) {
      // check for buffer first otherwise tests fail on node@4.4
      // looks like buffers are accidentially detected as typed arrays
      return `Buffer.from('${source.toString('base64')}', 'base64')`
    } else if ((type = utils.isTypedArray(source))) {
      const tmp = []
      for (let i = 0; i < source.length; i++) {
        tmp.push(source[i])
      }
      return `new ${type}([${tmp.join(', ')}])`
    } else {
      const tmp = []
      // copy properties if not circular
      if (!~opts._visited.indexOf(source)) {
        opts._visited.push(source)
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (opts.reference && utils.isObject(source[key])) {
              opts._refs.push(key)
              if (!opts._refs.hasReference(source[key])) {
                tmp.push(Ref.wrapkey(key, opts) + ': ' + serialize(source[key], opts))
              }
              opts._refs.pop()
            } else {
              tmp.push(Ref.wrapkey(key, opts) + ': ' + serialize(source[key], opts))
            }
          }
        }
        opts._visited.pop()
        return `{${tmp.join(', ')}}`
      } else {
        if (opts.ignoreCircular) {
          return '{/*[Circular]*/}'
        } else {
          throw new Error('can not convert circular structures.')
        }
      }
    }
  } else if (utils.isString(source)) {
    return utils.quote(source, opts)
  } else {
    return '' + source
  }
}
module.exports = serialize
