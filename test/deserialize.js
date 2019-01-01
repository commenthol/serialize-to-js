/* eslint no-new-func:0 */
/* global describe, it */

'use strict'

var assert = require('assert')
var M = require('..')
var serialize = M.serialize
var deserialize = M.deserialize
var fixtures = require('./fixtures')

if (typeof assert.deepStrictEqual === 'undefined') {
  assert.deepStrictEqual = assert.deepEqual // eslint-disable-line
}

function log (arg) { // eslint-disable-line no-unused-vars
  console.log(JSON.stringify(arg))
}

describe('#deserialize', function () {
  describe('simple', function () {
    Object.keys(fixtures).forEach(function (tcName) {
      it(tcName, function () {
        var tc = fixtures[tcName]
        var inp = tc[1]
        var exp = tc[0]
        var fn = tc[2]
        var res = deserialize(inp)
        switch (fn) {
          case 'toString':
            assert.strictEqual(res.toString(), exp.toString())
            break
          default:
            assert.deepEqual(res, exp) // eslint-disable-line node/no-deprecated-api
        }
      })
    })
  })

  describe('safer operation', function () {
    it('harmful IIFE using `function` should throw - no deserialize', function () {
      var str = "(function(){ global.exploit = 'test'; eval('console.log(`exploited`)') })()"
      assert.throws(function () {
        deserialize(str)
      })
    })
    it('should throw on using `new Function`', function () {
      assert.throws(function () {
        var str = "new Function('Array.prototype.join = 1')()"
        deserialize(str)
      })
    })
    it('should not overwrite built-in objects', function () {
      deserialize("(Object.assign = 'exploited')")
      assert.ok(Object.assign !== 'exploited')
    })
  })

  describe('unsafe operation', function () {
    it('should not throw on using `new Function`', function () {
      var str = "new Function('return 25 + 9')()"
      var res = deserialize(str, true)
      assert.strictEqual(res, 34)
    })
    it('should not throw on using `eval`', function () {
      var str = "eval('25 + 9')"
      var res = deserialize(str, true)
      assert.strictEqual(res, 34)
    })
  })

  describe('serialize and deserialize', function () {
    it('an object', function () {
      var obj = {
        str: '<script>var a = 0 > 1</script>',
        num: 3.1415,
        bool: true,
        nil: null,
        undef: undefined,
        obj: { foo: 'bar' },
        arr: [1, '2'],
        regexp: /^test?$/,
        date: new Date()
      }
      var res = deserialize(serialize(obj), {})
      assert.deepEqual(res, obj) // eslint-disable-line node/no-deprecated-api
    })
  })
})
