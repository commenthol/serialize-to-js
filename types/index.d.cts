declare function serialize(source: unknown, opts?: {
    ignoreCircular?: boolean;
    reference?: boolean;
    unsafe?: boolean;
    references?: Array<[string, string]>;
}): string;
export = serialize;
