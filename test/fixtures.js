'use strict'

const isBrowser = (typeof window !== 'undefined')

function log (arg) {
  console.log(JSON.stringify(arg))
}

const isLessV12 = parseInt(process.versions.node.split('.')[0]) < 12

module.exports = {
  string: [
    "string's\n\"new\"   line",
    '"string\'s\\n\\"new\\"   line"'
  ],
  'string with unsafe characters': [
    '<script type="application/javascript">\u2028\u2029\nvar a = 0;\nvar b = 1; a > 1;\n</script>',
    '"\\u003Cscript type=\\"application\\u002Fjavascript\\"\\u003E\\u2028\\u2029\\nvar a = 0;\\nvar b = 1; a \\u003E 1;\\n\\u003C\\u002Fscript\\u003E"',
    // unsafe ...
    '"<script type=\\"application/javascript\\">\u2028\u2029\\nvar a = 0;\\nvar b = 1; a > 1;\\n</script>"'
  ],
  number: [
    3.1415,
    '3.1415'
  ],
  boolean: [
    true,
    'true'
  ],
  undefined: [
    undefined,
    'undefined'
  ],
  null: [
    null,
    'null'
  ],
  regex: [
    /test(?:it)?/ig,
    'new RegExp("test(?:it)?", "gi")'
  ],
  object: [
    { a: 1, b: 2 },
    '{a: 1, b: 2}'
  ],
  'empty object': [
    {},
    '{}'
  ],
  'object with backslash': [
    { backslash: '\\' },
    '{backslash: "\\u005C"}'
  ],
  'object of primitives': [
    {
      one: true,
      two: false,
      'thr-ee': undefined,
      four: 1,
      5: 3.1415,
      six: -17,
      'se ven': 'string'
    },
    '{"5": 3.1415, one: true, two: false, "thr-ee": undefined, four: 1, six: -17, "se ven": "string"}'
  ],
  function: [
    log,
    log.toString()
  ],
  'arrow function': [
    (a) => a + 1,
    '(a) => a + 1'
  ],
  'shorthand method': [
    { key(a) { return a + 1 } }, // eslint-disable-line
    '{key: function key(a) { return a + 1 }}'
  ],
  'arrow function in object': [
    { key: (a) => a + 1 },
    '{key: (a) => a + 1}'
  ],
  date: [
    new Date(24 * 12 * 3600000),
    'new Date("1970-01-13T00:00:00.000Z")'
  ],
  error: [
    new Error('error'),
    'new Error("error")'
  ],
  'empty error': [
    new Error(),
    'new Error()'
  ],
  'array of primitives': [
    [true, false, undefined, 1, 3.1415, -17, 'string'],
    '[true, false, undefined, 1, 3.1415, -17, "string"]'
  ],
  Int8Array: [
    new Int8Array([1, 2, 3, 4, 5]),
    'new Int8Array([1, 2, 3, 4, 5])'
  ],
  Uint8Array: [
    new Uint8Array([1, 2, 3, 4, 5]),
    'new Uint8Array([1, 2, 3, 4, 5])'
  ],
  Uint8ClampedArray: [
    new Uint8ClampedArray([1, 2, 3, 4, 5]),
    'new Uint8ClampedArray([1, 2, 3, 4, 5])'
  ],
  Int16Array: [
    new Int16Array([-1, 0, 2, 3, 4, 5]),
    'new Int16Array([-1, 0, 2, 3, 4, 5])'
  ],
  Uint16Array: [
    new Uint16Array([1, 2, 3, 4, 5]),
    'new Uint16Array([1, 2, 3, 4, 5])'
  ],
  Int32Array: [
    new Int32Array([1, 2, 3, 4, 5]),
    'new Int32Array([1, 2, 3, 4, 5])'
  ],
  Uint32Array: [
    new Uint32Array([1, 2, 3, 4, 5]),
    'new Uint32Array([1, 2, 3, 4, 5])'
  ],
  Float32Array: [
    new Float32Array([1e10, 2000000, 3.1415, -4.9e2, 5]),
    'new Float32Array([10000000000, 2000000, 3.1414999961853027, -490, 5])'
  ],
  Float64Array: [
    new Float64Array([1e12, 2000000, 3.1415, -4.9e2, 5]),
    'new Float64Array([1000000000000, 2000000, 3.1415, -490, 5])'
  ],
  regexXss: [
    /[</script><script>alert('xss')//]/i,
    isLessV12
      ? `new RegExp("[\\u003C\\u005C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert('xss')\\u005C\\u002F\\u005C\\u002F]", "i")`
      : 'new RegExp("[\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F]", "i")',
    // unsafe ...
    isLessV12
      ? `new RegExp("[<\\u005C/script><script>alert('xss')\\u005C/\\u005C/]", "i")`
      : 'new RegExp("[</script><script>alert(\'xss\')//]", "i")'
  ],
  regexXss2: [
    /[</ script><script>alert('xss')//]/i,
    isLessV12
      ? `new RegExp("[\\u003C\\u005C\\u002F script\\u003E\\u003Cscript\\u003Ealert('xss')\\u005C\\u002F\\u005C\\u002F]", "i")`
      : 'new RegExp("[\\u003C\\u002F script\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F]", "i")',
    // unsafe ...
    isLessV12
      ? `new RegExp("[<\\u005C/ script><script>alert('xss')\\u005C/\\u005C/]", "i")`
      : 'new RegExp("[</ script><script>alert(\'xss\')//]", "i")'
  ],
  'regex no flags': [
    /abc/,
    'new RegExp("abc", "")'
  ],
  'error with unsafe message': [
    new Error("</script><script>alert('xss')"),
    'new Error("\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')")',
    // unsafe ...
    'new Error("</script><script>alert(\'xss\')")'
  ],
  'object with unsafe property name': [
    { "</script><script>alert('xss')//": 0 },
    '{"\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003Ealert(\'xss\')\\u002F\\u002F": 0}',
    // unsafe ...
    `{"</script><script>alert('xss')//": 0}`
  ],
  'object with backslash-escaped quote in property name': [
    { '\\": 0}; alert(\'xss\')//': 0 },
    `{"\\u005C\\": 0}; alert('xss')\\u002F\\u002F": 0}`,
    // unsafe ...
    `{"\\u005C\\": 0}; alert('xss')//": 0}`
  ]
}

if (!isBrowser) {
  Object.assign(module.exports, {
    buffer: [
      Buffer.from('buffer'),
      "Buffer.from('YnVmZmVy', 'base64')"
    ],
    'empty buffer': [
      Buffer.from(''),
      "Buffer.from('', 'base64')"
    ]
  })
}
