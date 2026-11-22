/**
 * serializes an object to javascript
 *
 * @example <caption>serializing regex, date, buffer, ...</caption>
 * const serialize = require('serialize-to-js')
 * const obj = {
 *   str: '<script>var a = 0 > 1</script>',
 *   num: 3.1415,
 *   bool: true,
 *   nil: null,
 *   undef: undefined,
 *   obj: { foo: 'bar' },
 *   arr: [1, '2'],
 *   regexp: /^test?$/,
 *   date: new Date(),
 *   buffer: new Buffer('data'),
 *   set: new Set([1, 2, 3]),
 *   map: new Map([['a': 1],['b': 2]])
 * }
 * console.log(serialize(obj))
 * //> '{str: "\u003Cscript\u003Evar a = 0 \u003E 1\u003C\u002Fscript\u003E",
 * //>   num: 3.1415, bool: true, nil: null, undef: undefined,
 * //>   obj: {foo: "bar"}, arr: [1, "2"], regexp: new RegExp("^test?$", ""),
 * //>   date: new Date("2019-12-29T10:37:36.613Z"),
 * //>   buffer: Buffer.from("ZGF0YQ==", "base64"), set: new Set([1, 2, 3]),
 * //>   map: new Map([["a", 1], ["b", 2]])}'
 *
 * @example <caption>serializing while respecting references</caption>
 * const serialize = require('serialize-to-js')
 * const obj = { object: { regexp: /^test?$/ } };
 * obj.reference = obj.object;
 * const opts = { reference: true };
 * console.log(serialize(obj, opts));
 * //> {object: {regexp: /^test?$/}}
 * console.log(opts.references);
 * //> [ [ '.reference', '.object' ] ]
 *
 * @param {unknown} source - source to serialize
 * @param {Object} [opts] - options
 * @param {boolean} [opts.ignoreCircular] - ignore circular objects
 * @param {boolean} [opts.reference] - reference instead of a copy (requires post-processing of opts.references)
 * @param {boolean} [opts.unsafe] - do not escape chars `<>/`
 * @param {Array<[string, string]>} [opts.references] - populated with references when `reference` is enabled
 * @return {string} serialized representation of `source`
 */
declare function serialize(source: unknown, opts?: {
    ignoreCircular?: boolean;
    reference?: boolean;
    unsafe?: boolean;
    references?: Array<[string, string]>;
}): string;
export default serialize;
