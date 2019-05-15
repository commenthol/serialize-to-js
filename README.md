# serialize-to-js

> serialize objects to javascript

[![NPM version](https://badge.fury.io/js/serialize-to-js.svg)](https://www.npmjs.com/package/serialize-to-js/)
[![Build Status](https://secure.travis-ci.org/commenthol/serialize-to-js.svg?branch=master)](https://travis-ci.org/commenthol/serialize-to-js)

Serialize objects into a `require`-able module while checking circular structures and respecting references.

The following Objects are supported

- String
- Number
- Boolean
- Object
- Array
- RegExp
- Error
- Date
- Buffer
- Int8Array, Uint8Array, Uint8ClampedArray
- Int16Array, Uint16Array
- Int32Array, Uint32Array, Float32Array
- Float64Array

## Table of Contents

<!-- !toc (minlevel=2 omit="Table of Contents") -->

* [Methods](#methods)
  * [serialize](#serialize)
  * [serializeToModule](#serializetomodule)
* [Contribution and License Agreement](#contribution-and-license-agreement)
* [License](#license)

<!-- toc! -->

## Methods

### serialize

`serialize(source, opts, opts.ignoreCircular, opts.reference)`

serializes an object to javascript

#### Example - serializing regex, date, buffer, ...

```js
var serialize = require('serialize-to-js').serialize;
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
  buffer: Buffer.from('data'),
}
console.log(serialize(obj))
// > {str: "\u003Cscript\u003Evar a = 0 \u003E 1\u003C\u002Fscript\u003E", num: 3.1415, bool: true, nil: null, undef: undefined, obj: {foo: "bar"}, arr: [1, "2"], regexp: /^test?$/, date: new Date("2016-04-15T16:22:52.009Z"), buffer: new Buffer('ZGF0YQ==', 'base64')}
```

#### Example - serializing while respecting references

```js
var serialize = require('serialize-to-js').serialize;
var obj = { object: { regexp: /^test?$/ } };
obj.reference = obj.object;
var opts = { reference: true };
console.log(serialize(obj, opts));
//> {object: {regexp: /^test?$/}}
console.log(opts.references);
//> [ [ '.reference', '.object' ] ]
```

**Parameters**

**source**: `Object | Array | function | Any`, source to serialize

**opts**: `Object`, options

**opts.ignoreCircular**: `Boolean`, ignore circular objects

**opts.reference**: `Boolean`, reference instead of a copy (requires post-processing of opts.references)

**opts.unsafe**: `Boolean`, do not escape chars `<>/`

**Returns**: `String`, serialized representation of `source`


### serializeToModule

`serializeToModule(source, opts, opts.ignoreCircular, opts.reference, opts.comment, opts.beautify) `

serialize to a module which can be `require`ed.

#### Example - serializing while respecting references

```js
var serialTM = require('serialize-to-js').serializeToModule;
var obj = { object: { regexp: /^test?$/ } };
obj.reference = obj.object;
console.log(serialTM(obj, { reference: true }));
//> var m = module.exports = {
//>     object: {
//>         regexp: /^test?$/
//>     }
//> };
//> m.reference = m.object;
```

**Parameters**

**source**: `Object | Array | function | Any`, source to serialize

**opts**: `Object`, options

**opts.ignoreCircular**: `Boolean`, ignore circular objects

**opts.reference**: `Boolean`, reference instead of a copy (requires post-processing of opts.references)

**opts.comment**: `Boolean`, add a comments - useful for linting tools e.g. using 'eslint-disable'

**opts.beautify**: `Boolean | Object`, beautify output - default is `false`. If Object then use je-beautify options.

**opts.unsafe**: `Boolean`, do not escape chars `<>/`

**Returns**: `String`, serialized representation of `source` as module

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2016- commenthol (MIT License)

See [LICENSE][] for more info.

[LICENSE]: ./LICENSE
[safer-eval]: https://github.com/commenthol/safer-eval
