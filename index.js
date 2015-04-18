/*
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict';

// dependencies
var util = require('mergee').util;
var beautify = require('js-beautify').js_beautify;
var Ref = require('./lib/reference');

/**
 * wrap an object key
 * @api private
 * @param {String} key - objects key
 * @return {String} wrapped key in quotes if necessary
 */
function _wrapkey(key) {
	return (/^[a-zA-Z$_][a-zA-Z$_0-9]+$/.test(key) ? key : "'"+key+"'");
}

/**
 * serializes an object to javascript
 *
 * #### Example - serializing regex, date, buffer, ...
 *
 * ```js
 * var serialize = require('serialize-to-js').serialize;
 * var obj = { object: {
 *         regexp: /^test?$/,
 *         date: new Date(),
 *         buffer: new Buffer('data'),
 *         number: 3.1415,
 *         string: "test" } };
 * console.log(serialize(obj));
 * //> {object: {regexp: /^test?$/, date: new Date('2015-04-18T09:47:03.316Z'), buffer: new Buffer([100, 97, 116, 97]), number: 3.1415, string: 'test'}}
 * ```
 *
 * #### Example - serializing while respecting references
 *
 * ```js
 * var serialize = require('serialize-to-js').serialize;
 * var obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * var opts = { reference: true };
 * console.log(serialize(obj, opts));
 * //> {object: {regexp: /^test?$/}}
 * console.log(opts.references);
 * //> [ [ 'reference', 'object' ] ]
 * ```
 *
 * @param {Object|Array|Function|Any} source - source to serialize
 * @param {Object} [opts] - options
 * @param {Boolean} opts.ignoreCircular - ignore circular objects
 * @param {Boolean} opts.reference - reference instead of a copy (requires post-processing of opts.references)
 * @return {String} serialized representation of `source`
 */
function serialize(source, opts) {
	var out = '',
		key,
		tmp;

	opts = opts || {};
	if (!opts._visited) {
		opts._visited = [];
	}
	if (!opts._refs) {
		opts.references = [];
		opts._refs = new Ref(opts.references);
	}

	if (util.isArray(source)) {
		tmp = [];
		source.forEach(function(item){
			tmp.push(serialize(item, opts));
		});
		out += '[' +  tmp.join(', ') + ']';
	}
	else if (util.isFunction(source)) {
		out += source.toString();
	}
	else if (util.isObject(source)) {
		if (util.isNull(source)){
			out += 'null';
		}
		else if (util.isRegExp(source)){
			out += source.toString();
		}
		else if (util.isDate(source)){
			out += "new Date('" + source.toJSON() + "')";
		}
		else if (util.isError(source)){
			out += "new Error(" + (source.message ? "'"+source.message+"'" : '') + ")";
		}
		else if (util.isBuffer(source)){
			out += "new Buffer('" + source.toString('base64') + "', 'base64')";
		}
		else {
			tmp = [];
			// copy properties if not circular
			if ( ! ~opts._visited.indexOf(source) ){
				opts._visited.push(source);
				for (key in source) {
					if (source.hasOwnProperty(key)) {
						if (opts.reference && util.isObject(source[key])) {
							opts._refs.push(key);
							if (!opts._refs.hasReference(source[key])) {
								tmp.push(_wrapkey(key) + ': ' + serialize(source[key], opts));
							}
							opts._refs.pop();
						}
						else {
							tmp.push(_wrapkey(key) + ': ' + serialize(source[key], opts));
						}
					}
				}
				out += '{' +  tmp.join(', ') + '}';
				opts._visited.pop();
			}
			else {
				if (!opts.ignoreCircular) {
					throw new Error('can not convert circular structures.');
				}
			}
		}
	}
	else if (util.isString(source)) {
		out += "'" + source.replace(/'/g, "\\'") + "'";
	}
	else {
		out += ''+ source;
	}
	return out;
}
exports.serialize = serialize;

/**
 * serialize to a module which can be `require`ed.
 *
 * #### Example - serializing while respecting references
 *
 * ```js
 * var serialTM = require('serialize-to-js').serializeToModule;
 * var obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * console.log(serialTM(obj, { reference: true }));
 * //> var m = module.exports = {
 * //> 	object: {
 * //> 		regexp: /^test?$/
 * //> 	}
 * //> };
 * //> m.reference = m.object;
 * ```
 *
 * @param {Object|Array|Function|Any} source - source to serialize
 * @param {Object} [opts] - options
 * @param {Boolean} opts.ignoreCircular - ignore circular objects
 * @param {Boolean} opts.reference - reference instead of a copy (requires post-processing of opts.references)
 * @param {Boolean|Object} opts.beautify - beautify output - default is `false`. If Object then use je-beautify options.
 * @return {String} serialized representation of `source` as module
 */
function serializeToModule(source, opts) {
	opts = opts || {};
	if (opts.reference) {
		opts.references = [];
	}
	var out = 'var m = module.exports = ' + serialize(source, opts) + ';\n';
	if (opts.references) {
		opts.references.forEach(function(i){
			out += 'm.' + i[0] + ' = m.' + i[1] + ';\n';
		});
	}
	if (opts.beautify !== false) {
		if (typeof opts.beautify !== 'object') {
			opts.beautify = { indent_size: 1, indent_char: '\t' };
		}
		out = beautify(out, opts.beautify);
	}

	return out;
}
exports.serializeToModule = serializeToModule;
