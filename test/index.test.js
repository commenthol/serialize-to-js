/* eslint no-new-func: off */

'use strict'

const assert = require('assert')
const serialize = require('../src')

if (typeof assert.deepStrictEqual === 'undefined') {
  assert.deepStrictEqual = assert.deepEqual // eslint-disable-line
}

const isBrowser = (typeof window !== 'undefined')

function log (arg) {
  console.log(JSON.stringify(arg))
}

const isLessV12 = parseInt(process.versions.node.split('.')[0]) < 12

describe.node = isBrowser ? describe.skip : describe

describe('serialize-to-js', function () {
  function test (name, inp, exp, unsafe) {
    it(name, function () {
      const res = serialize(inp, { unsafe })
      if (typeof exp === 'object') {
        assert.deepStrictEqual(res, exp)
      } else {
        assert.strictEqual(res, exp)
      }
    })
  }

  describe('safe mode', function () {
    test('undefined', undefined, 'undefined')
    test('null', null, 'null')
    test('boolean', true, 'true')
    test('number', 3.1415, '3.1415')
    test('number int', 3, '3')
    test('number negative int', -13, '-13')
    test('number float', 0.1, '0.1')
    test('number negative float', -0.2, '-0.2')
    test('NaN', NaN, 'NaN')
    test('Infinity', Infinity, 'Infinity')
    test('string', "string's\n\"new\"   line", '"string\'s\\n\\"new\\"   line"')
    test('empty string', '', '""')
    test('nul string', '\0', '"\u0000"')
    test('string with unsafe characters',
      '<script type="application/javascript">\u2028\u2029\nvar a = 0;\nvar b = 1; a > 1;\n</script>',
      '"\\u003Cscript type=\\"application\\u002Fjavascript\\"\\u003E\\u2028\\u2029\\nvar a = 0;\\nvar b = 1; a \\u003E 1;\\n\\u003C\\u002Fscript\\u003E"'
    )
    test('string with all unsafe characters', '<>\\\\ \t\n/', '"\\u003C\\u003E\\u005C\\u005C \\t\\n\\u002F"')
    test('empty object', {}, '{}')
    test('object', { a: 1, b: 2 }, '{a: 1, b: 2}')
    test('object with backslash', { backslash: '\\' }, '{backslash: "\\u005C"}')
    test('object of primitives',
      { one: true, two: false, 'thr-ee': undefined, four: 1, 5: 3.1415, six: -17, 'se ven': 'string' },
      '{"5": 3.1415, one: true, two: false, "thr-ee": undefined, four: 1, six: -17, "se ven": "string"}'
    )
    test('object with unsafe property name',
      { "</script><script>alert('xss')//": 0 },
      '{"\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F": 0}'
    )
    test('object with backslash-escaped quote in property name',
      { '\\": 0}; alert(\'xss\')//': 0 },
      '{"\\u005C\\": 0}; alert(\'xss\')\\u002F\\u002F": 0}'
    )
    test('function', log, log.toString())
    test('arrow function', { key: (a) => a + 1 }, '{key: (a) => a + 1}')
    test('date', new Date(24 * 12 * 3600000), 'new Date("1970-01-13T00:00:00.000Z")')
    test('invalid date', new Date('Invalid'), 'new Date("Invalid Date")')
    test('error', new Error('error'), 'new Error("error")')
    test('error with unsafe message',
      new Error("</script><script>alert('xss')"),
      'new Error("\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')")'
    )
    test('empty array', [], '[]')
    test('array',
      [true, false, undefined, 1, 3.1415, -17, 'string'],
      '[true, false, undefined, 1, 3.1415, -17, "string"]'
    )
    test('Int8Array',
      new Int8Array([1, 2, 3, 4, 5]),
      'new Int8Array([1, 2, 3, 4, 5])'
    )
    test('Uint8Array',
      new Uint8Array([1, 2, 3, 4, 5]),
      'new Uint8Array([1, 2, 3, 4, 5])'
    )
    test('Uint8ClampedArray',
      new Uint8ClampedArray([1, 2, 3, 4, 5]),
      'new Uint8ClampedArray([1, 2, 3, 4, 5])'
    )
    test('Int16Array',
      new Int16Array([-1, 0, 2, 3, 4, 5]),
      'new Int16Array([-1, 0, 2, 3, 4, 5])'
    )
    test('Uint16Array',
      new Uint16Array([1, 2, 3, 4, 5]),
      'new Uint16Array([1, 2, 3, 4, 5])'
    )
    test('Int32Array',
      new Int32Array([1, 2, 3, 4, 5]),
      'new Int32Array([1, 2, 3, 4, 5])'
    )
    test('Uint32Array',
      new Uint32Array([1, 2, 3, 4, 5]),
      'new Uint32Array([1, 2, 3, 4, 5])'
    )
    test('Float32Array',
      new Float32Array([1e10, 2000000, 3.1415, -4.9e2, 5]),
      'new Float32Array([10000000000, 2000000, 3.1414999961853027, -490, 5])'
    )
    test('Float64Array',
      new Float64Array([1e12, 2000000, 3.1415, -4.9e2, 5]),
      'new Float64Array([1000000000000, 2000000, 3.1415, -490, 5])'
    )
    test('regex no flags', /abc/, 'new RegExp("abc", "")')
    test('regex unsafe characters',
      /<>\/\\\t\n\r\b\0/migsu,
      'new RegExp("\\u003C\\u003E\\u005C\\u002F\\u005C\\u005C\\u005Ct\\u005Cn\\u005Cr\\u005Cb\\u005C0", "gimsu")'
    )
    test('regexXss',
      /[</script><script>alert('xss')//]/i,
      isLessV12
        ? 'new RegExp("[\\u003C\\u005C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u005C\\u002F\\u005C\\u002F]", "i")'
        : 'new RegExp("[\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F]", "i")'
    )
    test('regexXss2',
      /[</ script><script>alert('xss')//]/i,
      isLessV12
        ? 'new RegExp("[\\u003C\\u005C\\u002F script\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u005C\\u002F\\u005C\\u002F]", "i")'
        : 'new RegExp("[\\u003C\\u002F script\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F]", "i")'
    )
    test('Set',
      new Set(['a', 1.2, true, ['b', 3], { c: 4 }]),
      'new Set(["a", 1.2, true, ["b", 3], {c: 4}])'
    )
    test('Map',
      new Map([['a', 'a'], [1.2, 1.2], [true, true], [['b', 3], ['b', 3]], [{ c: 4 }, { c: 4 }]]),
      'new Map([["a", "a"], [1.2, 1.2], [true, true], [["b", 3], ["b", 3]], [{c: 4}, {c: 4}]])'
    )
  })

  describe('unsafe mode', function () {
    test('string with unsafe characters',
      '<script type="application/javascript">\u2028\u2029\nvar a = 0;\nvar b = 1; a > 1;\n</script>',
      '"<script type=\\"application/javascript\\">\u2028\u2029\\nvar a = 0;\\nvar b = 1; a > 1;\\n</script>"',
      true
    )
    test('object with unsafe property name',
      { "</script><script>alert('xss')//": 0 },
      '{"</script><script>alert(\'xss\')//": 0}',
      true
    )
    test('object with backslash-escaped quote in property name',
      { '\\": 0}; alert(\'xss\')//': 0 },
      '{"\\u005C\\": 0}; alert(\'xss\')//": 0}',
      true
    )
    test('error with unsafe message',
      new Error("</script><script>alert('xss')"),
      'new Error("</script><script>alert(\'xss\')")',
      true
    )
    test('regexXss',
      /[</script><script>alert('xss')//]/i,
      isLessV12
        ? 'new RegExp("[<\\u005C/script><script>alert(\'xss\')\\u005C/\\u005C/]", "i")'
        : 'new RegExp("[</script><script>alert(\'xss\')//]", "i")',
      true
    )
    test('regexXss2',
      /[</ script><script>alert('xss')//]/i,
      isLessV12
        ? 'new RegExp("[<\\u005C/ script><script>alert(\'xss\')\\u005C/\\u005C/]", "i")'
        : 'new RegExp("[</ script><script>alert(\'xss\')//]", "i")',
      true
    )
  })

  describe.node('Buffer', function () {
    test('buffer', Buffer.from('buffer'), 'Buffer.from("YnVmZmVy", "base64")')
    test('empty buffer', Buffer.from(''), 'Buffer.from("", "base64")')
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
    it('shall unmarshal to Invalid Date', function () {
      const res = eval(serialize(new Date('Invalid'))) // eslint-disable-line no-eval
      assert.strictEqual(res.toString(), new Date('Invalid').toString())
    })
    it('shall unmarshal Set', function () {
      const set = new Set(['a', 1.2, true, ['b', 3], { c: 4 }])
      const res = eval(serialize(set)) // eslint-disable-line no-eval
      assert.deepStrictEqual(Array.from(res), Array.from(set))
    })
    it('shall unmarshal Map', function () {
      const map = new Map([['a', 'a'], [1.2, 1.2], [true, true], [['b', 3], ['b', 3]], [{ c: 4 }, { c: 4 }]])
      const res = eval(serialize(map)) // eslint-disable-line no-eval
      assert.deepStrictEqual(Array.from(res), Array.from(map))
    })
  })

  describe('circular', function () {
    it('circular Object thows', function () {
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
    it('Object ignore circularity', function () {
      const opts = { ignoreCircular: true }
      const o = {}
      o.self = o
      const res = serialize(o, opts)
      const exp = '{self: {/*[Circular]*/}}'
      assert.strictEqual(res, exp)
    })
    it('Object ignore circularity #2', function () {
      const o = {
        a: {
          b: {}
        }
      }
      o.a.b = o.a
      const res = serialize(o, { ignoreCircular: true })
      const exp = '{a: {b: {/*[Circular]*/}}}'
      assert.strictEqual(res, exp)
    })
    it('circular Array throws', function () {
      const arr = []
      arr[0] = arr
      assert.throws(function () {
        serialize(arr)
      }, /can not convert circular structures/)
    })
    it('Array ignore circularity', function () {
      const arr = []
      arr[0] = arr
      const res = serialize(arr, { ignoreCircular: true })
      const exp = '[[/*[Circular]*/]]'
      assert.strictEqual(res, exp)
    })
    it('circular Set throws', function () {
      const set = new Set()
      set.add(set)
      set.add('foo')
      assert.throws(function () {
        serialize(set)
      }, /can not convert circular structures/)
    })
    it('Set ignore circularity', function () {
      const set = new Set()
      set.add(set)
      set.add('foo')
      const res = serialize(set, { ignoreCircular: true })
      const exp = 'new Set([undefined /*[Circular]*/, "foo"])'
      assert.strictEqual(res, exp)
    })
    it('circular Map throws', function () {
      const map = new Map()
      map.set('self', map)
      map.set('foo', 'bar')
      assert.throws(function () {
        serialize(map)
      }, /can not convert circular structures/)
    })
    it('Map ignore circularity', function () {
      const map = new Map()
      map.set('self', map)
      map.set('foo', 'bar')
      const res = serialize(map, { ignoreCircular: true })
      const exp = 'new Map([["self", undefined /*[Circular]*/], ["foo", "bar"]])'
      assert.strictEqual(res, exp)
    })
  })
})
