import { isAsyncIterable } from '../helpers/index.js';
import type { PipeFn } from '../internalTypes.js';

/**
 * Append values onto the end of an iterable.
 * @param iterablesToAppend - the iterables in the order to be appended.
 * @returns
 */
export function opAppendAsync<T>(
    ...iterablesToAppend: (AsyncIterable<T> | Iterable<T>)[]
): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T> {
    async function* fn(iter: AsyncIterable<T> | Iterable<T>) {
        yield* iter;
        for (const i of iterablesToAppend) {
            yield* i;
        }
    }

    return fn;
}

/**
 * Append values onto the end of an iterable.
 * @param iterablesToAppend - the iterables in the order to be appended.
 * @returns
 */
export function opAppendSync<T>(...iterablesToAppend: Iterable<T>[]): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        yield* iter;
        for (const i of iterablesToAppend) {
            yield* i;
        }
    }

    return fn;
}

export function opAppend<T>(...iterablesToAppend: Iterable<T>[]): PipeFn<T, T> {
    function _(i: Iterable<T>): Iterable<T>;
    function _(i: AsyncIterable<T>): AsyncIterable<T>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<T> | AsyncIterable<T> {
        return isAsyncIterable(i) ? opAppendAsync(...iterablesToAppend)(i) : opAppendSync(...iterablesToAppend)(i);
    }
    return _;
}
