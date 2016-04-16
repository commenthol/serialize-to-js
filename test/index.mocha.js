/* eslint
   no-new-func: 0
 */
/* global describe, it */

'use strict'

var assert = require('assert')
var M = require('..')

function log (arg) {
  console.log(JSON.stringify(arg))
}

function getObj (str) {
  return new Function('var module = {};\n' + str + '\n return m;')()
}

describe('#serialize simple', function () {
  it('function only', function () {
    var res = M.serialize(log)
    var exp = log.toString()
    assert.equal(res, exp)
  })
  it('string only', function () {
    var res = M.serialize("string's\n\"new\"\t line")
    var exp = '"string\'s\\n\\"new\\"\\t line"'
    assert.equal(res, exp)
  })
  it('string with unsafe characters', function () {
    var res = M.serialize('<script type="application/javascript">\u2028\u2029\nvar a = 0;\nvar b = 1; a > 1;\n</script>')
    var exp = '"\\u003Cscript type=\\"application\\u002Fjavascript\\"\\u003E\\u2028\\u2029\\nvar a = 0;\\nvar b = 1; a \\u003E 1;\\n\\u003C\\u002Fscript\\u003E"'
    assert.equal(res, exp)
  })
  it('number only', function () {
    var res = M.serialize(3.1415)
    var exp = '3.1415'
    assert.equal(res, exp)
  })
  it('boolean only', function () {
    var res = M.serialize(true)
    var exp = 'true'
    assert.equal(res, exp)
  })
  it('undefined only', function () {
    var res = M.serialize(undefined)
    var exp = 'undefined'
    assert.equal(res, exp)
  })
  it('regex only', function () {
    var res = M.serialize(/test(?:it)?/ig)
    var exp = '/test(?:it)?/gi'
    assert.equal(res, exp)
  })
  it('date only', function () {
    var d = new Date(24 * 12 * 3600000)
    var res = M.serialize(d)
    var exp = 'new Date("1970-01-13T00:00:00.000Z")'
    assert.equal(res, exp)
  })
  it('error only', function () {
    var e = new Error('error')
    var res = M.serialize(e)
    var exp = 'new Error("error")'
    assert.equal(res, exp)
  })
  it('empty error only', function () {
    var e = new Error()
    var res = M.serialize(e)
    var exp = 'new Error()'
    assert.equal(res, exp)
  })
  it('buffer only', function () {
    var b = new Buffer('buffer')
    var res = M.serialize(b)
    var exp = "new Buffer('YnVmZmVy', 'base64')"
    assert.equal(res, exp)
  })
  it('empty buffer only', function () {
    var b = new Buffer('')
    var res = M.serialize(b)
    var exp = "new Buffer('', 'base64')"
    assert.equal(res, exp)
  })
  it('null only', function () {
    var res = M.serialize(null)
    var exp = 'null'
    assert.equal(res, exp)
  })
  it('array of primitives only', function () {
    var a = [true, false, undefined, 1, 3.1415, -17, 'string']
    var res = M.serialize(a)
    var exp = '[true, false, undefined, 1, 3.1415, -17, "string"]'
    assert.equal(res, exp)
  })
  it('Int8Array only', function () {
    var a = new Int8Array([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Int8Array([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Uint8Array only', function () {
    var a = new Uint8Array([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Uint8Array([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Uint8ClampedArray only', function () {
    var a = new Uint8ClampedArray([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Uint8ClampedArray([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Int16Array only', function () {
    var a = new Int16Array([-1, 0, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Int16Array([-1, 0, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Uint16Array only', function () {
    var a = new Uint16Array([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Uint16Array([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Int32Array only', function () {
    var a = new Int32Array([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Int32Array([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Uint32Array only', function () {
    var a = new Uint32Array([1, 2, 3, 4, 5])
    var res = M.serialize(a)
    var exp = 'new Uint32Array([1, 2, 3, 4, 5])'
    assert.equal(res, exp)
  })
  it('Float32Array only', function () {
    var a = new Float32Array([1e10, 2000000, 3.1415, -4.9e2, 5])
    var res = M.serialize(a)
    var exp = 'new Float32Array([10000000000, 2000000, 3.1414999961853027, -490, 5])'
    assert.equal(res, exp)
  })
  it('Float64Array only', function () {
    var a = new Float64Array([1e12, 2000000, 3.1415, -4.9e2, 5])
    var res = M.serialize(a)
    var exp = 'new Float64Array([1000000000000, 2000000, 3.1415, -490, 5])'
    assert.equal(res, exp)
  })
  it('object of primitives only', function () {
    var o = {
      one: true,
      two: false,
      'thr-ee': undefined,
      four: 1,
      '5': 3.1415,
      six: -17,
      'se ven': 'string'
    }
    var res = M.serialize(o)
    var exp = '{"5": 3.1415, one: true, two: false, "thr-ee": undefined, four: 1, six: -17, "se ven": "string"}'
    assert.equal(res, exp)
  })
  it('empty object', function () {
    var res = M.serialize({})
    var exp = '{}'
    assert.equal(res, exp)
  })
})

describe('#serialize', function () {
  it('converting an object of objects', function () {
    var o1 = {
      one: true,
      'thr-ee': undefined,
      '3': '3',
      '4 four': 'four',
      'five"(5)': 5
    }
    var o = {
      a: o1,
      b: o1
    }
    var res = M.serialize(o)
    var exp = '{a: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four", "five\\"(5)": 5}, b: {"3": "3", one: true, "thr-ee": undefined, "4 four": "four", "five\\"(5)": 5}}'
      // ~ console.log(res);
    assert.equal(res, exp)
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
    var res = M.serialize(o, opts)
    var exp = '{"0": {four: 4}, a: {"3": "3", one: true, "thr-ee": undefined}, c: {}}'
    var refs = [
      ['.a["4 four"]', '["0"]'],
      ['.b', '.a'],
      ['.c["0"]', '.a'],
      ['.c.d', '.a'],
      ['.c["spa ce"]', '.a'],
      ['["spa ce"]', '.a']
    ]
    // console.log(res); console.log(opts.references);
    assert.equal(res, exp)
    assert.deepEqual(opts.references, refs)
  })

  it('converting a circular object throws', function () {
    var o = {
      a: {
        b: {}
      }
    }
    o.a.b = o.a
    assert.throws(function () {
      M.serialize(o)
    }, /can not convert circular structures/)
  })
})

describe('#serializeToModule', function () {
  it('object of objects', function () {
    var r = {
      one: true,
      'thr-ee': undefined
    }
    var o = {
      a: r,
      b: r,
      c: {
        d: r
      }
    }
    var res = M.serializeToModule(o)
    var exp = 'var m = module.exports = {\n\ta: {\n\t\tone: true,\n\t\t"thr-ee": undefined\n\t},\n\tb: {\n\t\tone: true,\n\t\t"thr-ee": undefined\n\t},\n\tc: {\n\t\td: {\n\t\t\tone: true,\n\t\t\t"thr-ee": undefined\n\t\t}\n\t}\n};'
      // ~ log(res);
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
  it('object of objects using references', function () {
    var r = {
      one: true,
      'thr-ee': undefined
    }
    var o = {
      a: r,
      b: r,
      c: {
        d: r,
        '0': r,
        'spa ce': r
      },
      '0': r,
      'spa ce': r
    }
    var res = M.serializeToModule(o, {
      reference: true,
      beautify: false
    })
    var exp = 'var m = module.exports = {"0": {one: true, "thr-ee": undefined}, c: {}};\nm.a = m["0"];\nm.b = m["0"];\nm.c["0"] = m["0"];\nm.c.d = m["0"];\nm.c["spa ce"] = m["0"];\nm["spa ce"] = m["0"];\n'
      // ~ log(res);
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
  it('object of objects - beautify', function () {
    var r = {
      one: true,
      'thr-ee': /^test$/
    }
    var o = {
      a: r,
      b: r,
      c: {
        d: r
      }
    }
    var res = M.serializeToModule(o, {
      reference: true
    })
    var exp = 'var m = module.exports = {\n\ta: {\n\t\tone: true,\n\t\t"thr-ee": /^test$/\n\t},\n\tc: {}\n};\nm.b = m.a;\nm.c.d = m.a;'
      // ~ log(res);
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
  it('obj - with comments header', function () {
    var o = {
      a: {
        b: 'one'
      }
    }
    var res = M.serializeToModule(o, {
      comment: 'eslint-disable'
    })
    var exp = '/* eslint-disable */\nvar m = module.exports = {\n\ta: {\n\t\tb: "one"\n\t}\n};'
    // log(res)
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
})

describe('#serialize and deserialize', function () {
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
      date: new Date(),
      buffer: new Buffer('data')
    }
    var res = M.deserialize(M.serialize(obj))
    assert.deepEqual(res, obj)
  })
})
