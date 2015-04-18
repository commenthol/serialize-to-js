# serialize-to-js

> serialize objects to javascript

[![NPM version](https://badge.fury.io/js/serialize-to-js.svg)](https://www.npmjs.com/package/serialize-to-js/)
[![Build Status](https://secure.travis-ci.org/commenthol/serialize-to-js.svg?branch=master)](https://travis-ci.org/commenthol/serialize-to-js)

Serialize objects into a `require`-able module while checking circular structures and respecting references.

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
var obj = { object: {
        regexp: /^test?$/,
        date: new Date(),
        buffer: new Buffer('data'),
        number: 3.1415,
        string: "test" } };
console.log(serialize(obj));
//> {object: {regexp: /^test?$/, date: new Date('2015-04-18T20:01:51.903Z'), buffer: new Buffer('ZGF0YQ==', 'base64'), number: 3.1415, string: 'test'}}
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
//> [ [ 'reference', 'object' ] ]
```

**Parameters**

**source**: `Object | Array | function | Any`, source to serialize

**opts**: `Object`, options

**opts.ignoreCircular**: `Boolean`, ignore circular objects

**opts.reference**: `Boolean`, reference instead of a copy (requires post-processing of opts.references)

**Returns**: `String`, serialized representation of `source`


### serializeToModule

`serializeToModule(source, opts, opts.ignoreCircular, opts.reference, opts.beautify)`

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

**opts.beautify**: `Boolean | Object`, beautify output - default is `false`. If Object then use je-beautify options.

**Returns**: `String`, serialized representation of `source` as module

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2015 commenthol (MIT License)

See [LICENSE][] for more info.

[LICENSE]: ./LICENSE





