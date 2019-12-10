/* eslint no-new-func:0 */
/* global describe, it */

'use strict'

var assert = require('assert')
var serialize = require('..')
var fixtures = require('./fixtures')

if (typeof assert.deepStrictEqual === 'undefined') {
  assert.deepStrictEqual = assert.deepEqual // eslint-disable-line
}

function log (arg) { // eslint-disable-line no-unused-vars
  console.log(JSON.stringify(arg))
}

describe('#serialize', function () {
  describe('simple', function () {
    Object.keys(fixtures).forEach(function (tcName) {
      it(tcName, function () {
        var tc = fixtures[tcName]
        var inp = tc[0]
        var exp = tc[1]
        var res = serialize(inp)
        if (typeof exp === 'object') {
          assert.deepStrictEqual(res, exp)
        } else {
          assert.strictEqual(res, exp)
        }
      })
    })
  })
  it('converting an object of objects', function () {
    var o1 = {
      one: true,
      'thr-ee': undefined,
      '3': '3',
      '4 four': 'four\n<test></test>',
      'five"(5)': 5
    }
    var o = {
      a: o1,
      b: o1
    }
    var res = serialize(o)
    var exp = '{a: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n\\u003Ctest\\u003E\\u003C\\u002Ftest\\u003E", "five\\"(5)": 5}, b: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n\\u003Ctest\\u003E\\u003C\\u002Ftest\\u003E", "five\\"(5)": 5}}'
    // console.log(JSON.stringify(res))
    assert.strictEqual(res, exp)
  })
  it('converting an object of objects using references', function () {
    var r = {
      one: true,
      'thr-ee': undefined,
      '3': '3',
      '4 four': {
        'four': 4
      }
    }
    var o = {
      a: r,
      b: r,
      c: {
        d: r,
        '0': r,
        'spa ce': r
      },
      '0': r['4 four'],
      'spa ce': r
    }
    var opts = {
      reference: true
    }
    var res = serialize(o, opts)
    var exp = '{"0": {four: 4}, a: {"3": "3", one: true, "thr-ee": undefined}, c: {}}'
    var refs = [
      ['.a["4 four"]', '["0"]'],
      ['.b', '.a'],
      ['.c["0"]', '.a'],
      ['.c.d', '.a'],
      ['.c["spa ce"]', '.a'],
      ['["spa ce"]', '.a']
    ]
    assert.strictEqual(res, exp)
    assert.deepStrictEqual(opts.references, refs)
  })
  it('converting a circular object throws', function () {
    var o = {
      a: {
        b: {}
      }
    }
    o.a.b = o.a
    assert.throws(function () {
      serialize(o)
    }, /can not convert circular structures/)
  })
  it('ignore circularity', function () {
    var o = {
      a: {
        b: {}
      }
    }
    o.a.b = o.a
    var res = serialize(o, { ignoreCircular: true })
    var exp = '{a: {b: {/*[Circular]*/}}}'
    assert.deepStrictEqual(res, exp)
  })
  it('converting an object of objects with opts.unsafe', function () {
    var o1 = {
      one: true,
      'thr-ee': undefined,
      '3': '3',
      '4 four': 'four\n<test></test>',
      'five"(5)': 5
    }
    var o = {
      a: o1,
      b: o1
    }
    var res = serialize(o, { unsafe: true })
    var exp = '{a: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n<test></test>", "five\\"(5)": 5}, b: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n<test></test>", "five\\"(5)": 5}}'
    assert.strictEqual(res, exp)
  })
  it('correctly serializes regular expressions', function () {
    for (var re of [ /\//, /[</script><script>alert('xss')//]/i, /abc/, /[< /script>]/ ]) {
      var re2 = eval(serialize(re)) // eslint-disable-line no-eval
      assert.strictEqual(re.source, re2.source)
      assert.strictEqual(re.flags, re2.flags)
    }
  })
})
