/* eslint no-new-func:0 */
/* global describe, it */

'use strict'

var assert = require('assert')
var serializeToModule = require('..').serializeToModule

function log (arg) { // eslint-disable-line no-unused-vars
  console.log(JSON.stringify(arg))
}

function getObj (str) {
  return new Function('var module = {};\n' + str + ';\nreturn module.exports')()
}

describe('#serializeToModule', function () {
  it('object of objects', function () {
    var r = {
      one: true,
      two: 'a string\nwith multiple\r\nlines.',
      'thr-ee': undefined
    }
    var o = {
      a: r,
      b: r,
      c: {
        d: r
      }
    }
    var res = serializeToModule(o)
    var exp = 'module.exports = {\n  a: {\n    one: true,\n    two: "a string\\nwith multiple\\r\\nlines.",\n    "thr-ee": undefined\n  },\n  b: {\n    one: true,\n    two: "a string\\nwith multiple\\r\\nlines.",\n    "thr-ee": undefined\n  },\n  c: {\n    d: {\n      one: true,\n      two: "a string\\nwith multiple\\r\\nlines.",\n      "thr-ee": undefined\n    }\n  }\n};'
    // log(res)
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
  it('object of objects using references', function () {
    var r = {
      one: true,
      two: 'a string\nwith multiple\r\nlines.',
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
    var res = serializeToModule(o, {
      reference: true,
      beautify: false
    })
    var exp = 'var m = module.exports = {"0": {one: true, two: "a string\\nwith multiple\\r\\nlines.", "thr-ee": undefined}, c: {}};\nm.a = m["0"];\nm.b = m["0"];\nm.c["0"] = m["0"];\nm.c.d = m["0"];\nm.c["spa ce"] = m["0"];\nm["spa ce"] = m["0"];\n'
    // log(res)
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
    var res = serializeToModule(o, {
      reference: true
    })
    var exp = 'var m = module.exports = {\n  a: {\n    one: true,\n    "thr-ee": /^test$/\n  },\n  c: {}\n};\nm.b = m.a;\nm.c.d = m.a;'
    // log(res);
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
  it('obj - with comments header', function () {
    var o = {
      a: {
        b: 'one'
      }
    }
    var res = serializeToModule(o, {
      comment: 'eslint-disable'
    })
    var exp = '/* eslint-disable */\nmodule.exports = {\n  a: {\n    b: "one"\n  }\n};'
    // log(res)
    assert.equal(res, exp)
    assert.deepEqual(o, getObj(res))
  })
})
