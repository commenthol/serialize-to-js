'use strict'

const UNSAFE_CHARS_REGEXP = /[<>\u2028\u2029/\\\r\n\t"]/g
const CHARS_REGEXP = /[\\\r\n\t"]/g

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
}

function safeString (str) {
  return str.replace(UNSAFE_CHARS_REGEXP, (unsafeChar) => {
    return UNICODE_CHARS[unsafeChar]
  })
}

function unsafeString (str) {
  str = str.replace(CHARS_REGEXP, (unsafeChar) => UNICODE_CHARS[unsafeChar])
  return str
}

function quote (str, opts) {
  const fn = opts.unsafe ? unsafeString : safeString
  return str ? `"${fn(str)}"` : ''
}

function saferFunctionString (str, opts) {
  return opts.unsafe
    ? str
    : str.replace(/(<\/?)([a-z][^>]*?>)/ig, (m, m1, m2) => safeString(m1) + m2)
}

function objectToString (o) {
  return Object.prototype.toString.call(o)
}

function toType (o) {
  const type = objectToString(o)
  return type.substring(8, type.length - 1)
}

function isString (arg) {
  return typeof arg === 'string'
}

function isNull (arg) {
  return arg === null
}

function isRegExp (re) {
  return isObject(re) && objectToString(re) === '[object RegExp]'
}

function isObject (arg) {
  return typeof arg === 'object' && arg !== null
}

function isDate (d) {
  return isObject(d) && objectToString(d) === '[object Date]'
}

function isError (e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error)
}

function isFunction (arg) {
  return typeof arg === 'function'
}

function isBuffer (arg) {
  return arg instanceof Buffer
}

const TYPED_ARRAYS = [
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array'
]

function isTypedArray (arg) {
  const type = toType(arg)
  if (TYPED_ARRAYS.indexOf(type) !== -1) {
    return type
  }
}

module.exports = {
  safeString,
  unsafeString,
  quote,
  saferFunctionString,
  isString,
  isNull,
  isRegExp,
  isObject,
  isDate,
  isError,
  isFunction,
  isBuffer,
  isTypedArray
}
