import type { RemoveUndefined } from './types.js';

// alias for uniqueFilterFnGenerator
export const uniqueFn: typeof uniqueFilterFnGenerator = uniqueFilterFnGenerator;

export function uniqueFilterFnGenerator<T>(): (v: T) => boolean;
export function uniqueFilterFnGenerator<T, U>(extractFn: (v: T) => U): (v: T) => boolean;
export function uniqueFilterFnGenerator<T>(extractFn?: (v: T) => T): (v: T) => boolean {
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
 * Delete all `undefined` and `null` fields from an object.
 * @param src - object to be cleaned
 */
export function clean<T extends object>(src: T): RemoveUndefined<T> {
    const r = src;
    type keyOfT = keyof T;
    type keysOfT = keyOfT[];
    for (const key of Object.keys(r) as keysOfT) {
        if (r[key] === undefined || r[key] === null) {
            delete r[key];
        }
    }
    return r as RemoveUndefined<T>;
}

/**
 * Creates a scan function that can be used in a map function.
 */
export function scanMap<T>(accFn: (acc: T, value: T) => T, init?: T): (value: T) => T;
export function scanMap<T, U>(accFn: (acc: U, value: T) => U, init: U): (value: T) => U;
export function scanMap<T>(accFn: (acc: T, value: T) => T, init?: T): (value: T) => T {
    let acc = init;
    let first = true;
    return function (value: T): T {
        if (first && acc === undefined) {
            first = false;
            acc = value;
            return acc;
        }
        acc = accFn(acc as T, value);
        return acc;
    };
}

export function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

export async function asyncIterableToArray<T>(iter: Iterable<T> | AsyncIterable<T>): Promise<Awaited<T>[]> {
    const acc: Awaited<T>[] = [];

    for await (const t of iter) {
        acc.push(t);
    }
    return acc;
}

/**
 * Shallow is Equal test.
 * @param a - array of values
 * @param b - array of values
 * @returns true if the values of `a` are exactly equal to the values of `b`
 */
export function isArrayEqual<K>(a: K[], b: K[]): boolean {
    if (a === b) return true;
    let isMatch = a.length === b.length;
    for (let i = 0; i < a.length && isMatch; ++i) {
        isMatch = a[i] === b[i];
    }
    return isMatch;
}

/**
 * Determine if two sets intersect
 * @param a - first Set
 * @param b - second Set
 * @returns true iff any element of `a` is in `b`
 */
export function doSetsIntersect<T>(a: Set<T>, b: Set<T>): boolean {
    function compare(a: Set<T>, b: Set<T>) {
        for (const item of a) {
            if (b.has(item)) return true;
        }
        return false;
    }
    return a.size <= b.size ? compare(a, b) : compare(b, a);
}

export function isRecordEqual<T extends Record<string, unknown>>(a: T | undefined, b: T | undefined): boolean {
    if (a === b) return true;
    if (a === undefined || b === undefined) return false;
    for (const key of Object.keys(a)) {
        if (a[key] !== b[key]) return false;
    }
    for (const key of Object.keys(b)) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}
