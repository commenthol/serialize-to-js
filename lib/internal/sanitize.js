'use strict'

var esprima = require('esprima')

/**
* remove `new Function`, `(function` and `eval` from `str`
* @param {String} str
* @return {String}
*/
module.exports = function sanitize (str) {
  var tokens = esprima.tokenize(str)
  // console.log(tokens)
  var i = 0
  while (i < tokens.length - 1) {
    var arr = tokens.slice(i, i + 2)
    var x = arr[0]
    var y = arr[1]
    if ((x.type === 'Identifier' && x.value === 'eval')) {
      tokens.splice(i, 1)
    } else if (
      (x.type === 'Punctuator' && y.type === 'Keyword' && /Function/i.test(y.value)) ||
      (y.type === 'Identifier' && y.value === 'eval')
    ) {
      tokens.splice(i + 1, 1)
    } else if (
      (x.type === 'Keyword' && x.value === 'new' &&
       y.type === 'Identifier' && /Function/i.test(y.value)) ||
      (x.type === 'Punctuator' && x.value === '(' &&
       y.type === 'Punctuator' && y.value === ')')
    ) {
      tokens.splice(i, 2)
    }
    i++
  }
  return tokens.map(function (t) {
    var sp = (t.type === 'Keyword') ? ' ' : ''
    return t.value + sp
  }).join('')
}
