/* eslint no-new-func: off */

'use strict'

const assert = require('assert')
const serialize = require('..')
const fixtures = require('./fixtures')

if (typeof assert.deepStrictEqual === 'undefined') {
  assert.deepStrictEqual = assert.deepEqual // eslint-disable-line
}

function log (arg) { // eslint-disable-line no-unused-vars
  console.log(JSON.stringify(arg))
}

describe('#serialize', function () {
  describe('fixtures', function () {
    Object.keys(fixtures).forEach(function (tcName) {
      it(tcName, function () {
        const tc = fixtures[tcName]
        const inp = tc[0]
        const exp = tc[1]
        const res = serialize(inp)
        if (typeof exp === 'object') {
          assert.deepStrictEqual(res, exp)
        } else {
          assert.strictEqual(res, exp)
        }
      })
    })
  })
  describe('fixtures unsafe mode', function () {
    Object.keys(fixtures).forEach(function (tcName) {
      it(tcName, function () {
        const tc = fixtures[tcName]
        const inp = tc[0]
        const exp = tc[2] || tc[1]
        const res = serialize(inp, { unsafe: true })
        if (typeof exp === 'object') {
          assert.deepStrictEqual(res, exp)
        } else {
          assert.strictEqual(res, exp)
        }
      })
    })
  })
  describe('others', function () {
    it('converting an object of objects', function () {
      const o1 = {
        one: true,
        'thr-ee': undefined,
        3: '3',
        '4 four': 'four\n<test></test>',
        'five"(5)': 5
      }
      const o = {
        a: o1,
        b: o1
      }
      const res = serialize(o)
      const exp = '{a: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n\\u003Ctest\\u003E\\u003C\\u002Ftest\\u003E", "five\\"(5)": 5}, b: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n\\u003Ctest\\u003E\\u003C\\u002Ftest\\u003E", "five\\"(5)": 5}}'
      // console.log(JSON.stringify(res))
      assert.strictEqual(res, exp)
    })
    it('converting an object of objects using references', function () {
      const r = {
        one: true,
        'thr-ee': undefined,
        3: '3',
        '4 four': {
          four: 4
        }
      }
      const o = {
        a: r,
        b: r,
        c: {
          d: r,
          0: r,
          'spa ce': r
        },
        0: r['4 four'],
        'spa ce': r
      }
      const opts = {
        reference: true
      }
      const res = serialize(o, opts)
      const exp = '{"0": {four: 4}, a: {"3": "3", one: true, "thr-ee": undefined}, c: {}}'
      const refs = [
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
      const o = {
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
      const o = {
        a: {
          b: {}
        }
      }
      o.a.b = o.a
      const res = serialize(o, { ignoreCircular: true })
      const exp = '{a: {b: {/*[Circular]*/}}}'
      assert.deepStrictEqual(res, exp)
    })
    it('converting an object of objects with opts.unsafe', function () {
      const o1 = {
        one: true,
        'thr-ee': undefined,
        3: '3',
        '4 four': 'four\n<test></test>',
        'five"(5)': 5
      }
      const o = {
        a: o1,
        b: o1
      }
      const res = serialize(o, { unsafe: true })
      const exp = '{a: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n<test></test>", "five\\"(5)": 5}, b: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four\\n<test></test>", "five\\"(5)": 5}}'
      assert.strictEqual(res, exp)
    })
    it('correctly serializes regular expressions', function () {
      for (const re of [/\//, /[</script><script>alert('xss')//]/i, /abc/, /[< /script>]/]) {
        const re2 = eval(serialize(re)) // eslint-disable-line no-eval
        assert.strictEqual(re.source, re2.source)
        assert.strictEqual(re.flags, re2.flags)
      }
    })
    it('serializes function with unsafe chars', function () {
      function xss () {
        const str = '</script><script>alert(\'xss\')//'
        const o = { '\\": 0}; alert(\'xss\')//': 0, str }
        return o
      }
      const res = serialize(xss)
        .replace(/\n\s+/mg, '\n ')
        .replace(/function xss\(\)/, 'function xss ()') // node v8 has no space before brackets
      assert.strictEqual(res,
        'function xss () {\n' +
        ' const str = \'\\u003C\\u002Fscript>\\u003Cscript>alert(\\\'xss\\\')//\'\n' +
        ' const o = { \'\\\\": 0}; alert(\\\'xss\\\')//\': 0, str }\n' +
        ' return o\n' +
        ' }'
      )
      const fn = new Function('return ' + res)()
      assert.deepStrictEqual(fn(), {
        "\\\": 0}; alert('xss')//": 0,
        str: "</script><script>alert('xss')//"
      })
    })
  })
})
