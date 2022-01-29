import { UndefinedToOptional } from '../types';

export function isDefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}

/**
 * Remove any fields with an `undefined` value.
 * @param t - object to clean
 * @returns t
 */
export function cleanCopy<T, U = UndefinedToOptional<T>>(t: T): U {
    const r: U = { ...(<U>(<unknown>t)) };
    return clean(r);
}

/**
 * Remove any fields with an `undefined` value.
 * **MODIFIES THE OBJECT**
 * @param t - object to clean
 * @returns t
 */
export function clean<T, U = UndefinedToOptional<T>>(t: T): U {
    for (const prop in t) {
        if (t[prop] === undefined) {
            delete t[prop];
        }
    }
    return <U>(<unknown>t);
}

export function unique<T>(a: Iterable<T>): T[] {
    return [...new Set(a)];
}

export function* flatten<T>(i: Iterable<Iterable<T>>): Iterable<T> {
    for (const v of i) {
        yield* v;
    }
}
