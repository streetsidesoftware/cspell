
export function asPromise<T>(thenable: { then(fnOnFulfil: (value: T) => T | Promise<T> | void, fnOnReject?: (reason?: any) => any): any }) {
    return new Promise<T>((resolve, reject) => {
        thenable.then(resolve, reject);
    });
}

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