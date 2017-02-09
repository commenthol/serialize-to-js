/* eslint no-new-func: 0 */
/* global describe, it */

'use strict'

var assert = require('assert')
var sanitize = require('../lib/internal/sanitize')

describe('#sanitize', function () {
  it('should remove "function"', function () {
    var res = sanitize('(function(){console.log(`exploited`)}))()')
    var exp = '({console.log(`exploited`)}))'
    assert.equal(res, exp)
  })
  it('should remove "new Function"', function () {
    var res = sanitize('new Function(console.log(`exploited`))()')
    var exp = '(console.log(`exploited`))'
    assert.equal(res, exp)
  })
  it('should remove "eval"', function () {
    var res = sanitize('(\n\tfunction(){eval(\'console.log(`exploited`)\') })()')
    var exp = "({('console.log(`exploited`)')})"
    assert.equal(res, exp)
  })
  it('should not join new Date', function () {
    var res = sanitize('new Date("1970-01-01T"00:00:00)')
    var exp = 'new Date("1970-01-01T"00:00:00)'
    assert.equal(res, exp)
  })
})
