
export function uniqueFilterFnGenerator<T>(): (v: T) => boolean;
export function uniqueFilterFnGenerator<T, U>(extractFn: (v: T) => U): (v: T) => boolean;
export function uniqueFilterFnGenerator<T>(extractFn?: (v: T) => T): (v: T) => boolean {
    const values = new Set<T>();
    const extractor = extractFn || (a => a);
    return (v: T) => {
        const vv = extractor(v);
        const ret = !values.has(vv);
        values.add(vv);
        return ret;
    };
}

export function unique<T>(src: T[]): T[] {
    return [...(new Set(src))];
}
