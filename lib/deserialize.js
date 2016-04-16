/*
 * @copyright 2016 commenthol
 * @license MIT
 */
/* eslint no-new-func: 0 */

'use strict'

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
 * @param {String} str - string containing serialized data
 * @return {Any} deserialized data
 */
function deserialize (str) {
  return (new Function('return ' + str))()
}
module.exports = deserialize
