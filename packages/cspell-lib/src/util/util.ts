import { RemoveUndefined } from './types';

// alias for uniqueFilterFnGenerator
export const uniqueFn = uniqueFilterFnGenerator;

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
 * Delete all `undefined` fields from an object.
 * @param src - object to be cleaned
 */
export function clean<T>(src: T): RemoveUndefined<T> {
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

export function* flattenIterable<T>(values: Iterable<Iterable<T>> | T[][]): Iterable<T> {
    for (const v of values) {
        yield* v;
    }
}

export function flatten<T>(values: Iterable<Iterable<T>> | T[][]): T[] {
    return [...flattenIterable(values)];
}

export async function asyncIterableToArray<T>(iter: Iterable<T> | AsyncIterable<T>): Promise<Awaited<T>[]> {
    const acc: Awaited<T>[] = [];

    for await (const t of iter) {
        acc.push(t);
    }
    return acc;
}
