// alias for uniqueFilterFnGenerator
export const uniqueFn = uniqueFilterFnGenerator;

type FilterFn<T> = (_v: T) => boolean;

export function uniqueFilterFnGenerator<T>(): FilterFn<T>;
export function uniqueFilterFnGenerator<T, U>(extractFn: (v: T) => U): FilterFn<T>;
export function uniqueFilterFnGenerator<T>(extractFn?: (v: T) => T): FilterFn<T> {
    const values = new Set<T>();
    const extractor = extractFn || ((a) => a);
    return (v: T) => {
        const vv = extractor(v);
        const ret = !values.has(vv);
        values.add(vv);
        return ret;
    };
}

export function unique<T>(src: T[]): T[] {
    return [...new Set(src)];
}

export function clean<T>(src: T): T {
    const r = src;
    type keyOfT = keyof T;
    type keysOfT = keyOfT[];
    for (const key of Object.keys(r) as keysOfT) {
        if (r[key] === undefined) {
            delete r[key];
        }
    }
    return r;
}

export function pad(s: string, w: number): string {
    if (s.length >= w) return s;
    return (s + ' '.repeat(w)).slice(0, w);
}

export function padLeft(s: string, w: number): string {
    if (s.length >= w) return s;
    return (' '.repeat(w) + s).slice(-w);
}
