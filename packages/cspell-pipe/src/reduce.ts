import { isAsyncIterable } from './helpers/index.js';
import { toArrayAsync } from './helpers/toArray.js';
import type { AnyIterable } from './internalTypes.js';
import { opReduceAsync, opReduceSync } from './operators/index.js';
import { pipeAsync, pipeSync } from './pipe.js';

export function reduceSync<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T): T | undefined;
export function reduceSync<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue: T): T;
export function reduceSync<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue?: T): T | undefined;
export function reduceSync<T, U>(iter: Iterable<T>, reduceFn: (prev: U, curr: T) => U, initialValue: U): U;
export function reduceSync<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue?: T): T | undefined {
    const i =
        initialValue !== undefined
            ? pipeSync(iter, opReduceSync(reduceFn, initialValue))
            : pipeSync(iter, opReduceSync(reduceFn));
    return [...i][0];
}

export function reduceAsync<T>(iter: AnyIterable<T>, reduceFn: (prev: T, curr: T) => T): Promise<T | undefined>;
export function reduceAsync<T>(iter: AnyIterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue: T): Promise<T>;
export function reduceAsync<T>(
    iter: AnyIterable<T>,
    reduceFn: (prev: T, curr: T) => T,
    initialValue?: T
): Promise<T | undefined>;
export function reduceAsync<T, U>(iter: AnyIterable<T>, reduceFn: (prev: U, curr: T) => U, initialValue: U): Promise<U>;
export async function reduceAsync<T>(
    iter: AnyIterable<T>,
    reduceFn: (prev: T, curr: T) => T,
    initialValue?: T
): Promise<T | undefined> {
    const i =
        initialValue !== undefined
            ? pipeAsync(iter, opReduceAsync(reduceFn, initialValue))
            : pipeAsync(iter, opReduceAsync(reduceFn));
    return (await toArrayAsync(i))[0];
}

export function reduce<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T): T | undefined;
export function reduce<T>(iter: Iterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue: T): T;
export function reduce<T, U>(iter: Iterable<T>, reduceFn: (prev: U, curr: T) => U, initialValue: U): U;
export function reduce<T>(iter: AsyncIterable<T>, reduceFn: (prev: T, curr: T) => T): Promise<T | undefined>;
export function reduce<T>(iter: AsyncIterable<T>, reduceFn: (prev: T, curr: T) => T, initialValue: T): Promise<T>;
export function reduce<T, U>(iter: AsyncIterable<T>, reduceFn: (prev: U, curr: T) => U, initialValue: U): Promise<U>;
export function reduce<T>(
    iter: Iterable<T> | AsyncIterable<T>,
    reduceFn: (prev: T, curr: T) => T,
    initialValue?: T
): T | undefined | Promise<T | undefined> {
    return isAsyncIterable(iter) ? reduceAsync(iter, reduceFn, initialValue) : reduceSync(iter, reduceFn, initialValue);
}
