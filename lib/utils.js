'use strict'

var UNSAFE_CHARS_REGEXP = /[\r\n\t<>\/\u2028\u2029"]/g

var UNICODE_CHARS = {
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}

function safeString (str) {
  str = str.replace(UNSAFE_CHARS_REGEXP, function (unsafeChar) {
    return UNICODE_CHARS[unsafeChar]
  })
  return str
}
exports.safeString = safeString
