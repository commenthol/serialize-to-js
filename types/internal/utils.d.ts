declare const _exports: {
    safeString: typeof safeString;
    unsafeString: typeof unsafeString;
    quote: typeof quote;
    saferFunctionString: typeof saferFunctionString;
    isBuffer: typeof isBuffer;
    isObject: typeof isObject;
    isInvalidDate: typeof isInvalidDate;
    toType: typeof toType;
};
export = _exports;
declare function safeString(str: any): any;
declare function unsafeString(str: any): any;
declare function quote(str: any, opts: any): string;
declare function saferFunctionString(str: any, opts: any): any;
declare function isObject(arg: any): boolean;
declare function isBuffer(arg: any): boolean;
declare function isInvalidDate(arg: any): boolean;
declare function toType(o: any): string;
