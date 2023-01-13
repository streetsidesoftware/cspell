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

/**
 * Make all properties in T required
 */
type RemoveUndefined<T extends object> = {
    [P in keyof T]: T[P] extends undefined ? never : T[P];
};

export function clean<T extends object>(src: T): RemoveUndefined<T> {
    const r = src;
    type keyOfT = keyof T;
    type keysOfT = keyOfT[];
    for (const key of Object.keys(r) as keysOfT) {
        if (r[key] === undefined) {
            delete r[key];
        }
    }
    return r as RemoveUndefined<T>;
}

export function padWidth(s: string, target: number): number {
    const sWidth = width(s);
    return Math.max(target - sWidth, 0);
}

export function pad(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return s + ' '.repeat(p);
}

export function padLeft(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return ' '.repeat(p) + s;
}

export function width(s: string): number {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\u0300-\u036f\x00-\x1f]/g, '').length;
}
