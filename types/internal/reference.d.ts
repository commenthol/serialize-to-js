export = Ref;
/**
 * handle references
 * @constructor
 * @param {Object} references
 * @param {boolean} opts.unsafe
 */
declare function Ref(references: Object, opts: any): void;
declare namespace Ref {
    var wrapkey: (key: string, opts: any) => string;
    var prototype: {
        /**
         * push `key` to interal array
         * @param {String} key
         */
        push: (key: string) => void;
        /**
         * remove the last key from internal array
         */
        pop: () => void;
        /**
         * join the keys
         */
        join: (key: any) => string;
        /**
         * check if object `source` has an already known reference.
         * If so then origin and source are stored in `opts.reference`
         * @param {Object} source - object to compare
         * @return {Boolean}
         */
        hasReference: (source: Object) => boolean;
        /**
         * get the references array
         * @return {Array} references array
         */
        getReferences: () => any[];
    };
}
