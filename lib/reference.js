/*
 * @copyright 2015 commenthol
 * @license MIT
 */

 'use strict';

/**
 * handle references
 * @constructor
 * @param {Object} references
 */
function Ref (references) {
	this.keys = [];
	this.refs = [];
	this.key = [];
	this.references = references || [];
}

Ref.prototype = {
	/**
	 * push `key` to interal array
	 * @param {String} key
	 */
	push: function(key) {
		this.key.push(key);
	},
	/**
	 * remove the last key from internal array
	 */
	pop: function() {
		this.key.pop();
	},
	/**
	 * join the keys
	 */
	joinKey: function() {
		return this.key.join('.');
	},
	/**
	 * check if object `source` has an already known reference.
	 * If so then origin and source are stored in `opts.reference`
	 * @param {Object} source - object to compare
	 * @return {Boolean}
	 */
	hasReference: function(source) {
		var idx;
		if (~(idx = this.refs.indexOf(source))) {
			this.references.push([ this.joinKey(), this.keys[idx] ]);
			return true;
		}
		else {
			this.refs.push(source);
			this.keys.push(this.joinKey());
		}
	},
	/**
	 * get the references array
	 * @return {Array} references array
	 */
	getReferences: function() {
		return this.references;
	},
};

module.exports = Ref;
