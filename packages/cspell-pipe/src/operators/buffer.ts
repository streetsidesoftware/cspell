import { isAsyncIterable } from '../helpers/util.js';
import type { PipeFn } from '../internalTypes.js';

/**
 * Buffer the input iterable into arrays of the given size.
 * @param size - The size of the buffer.
 * @returns A function that takes an async iterable and returns an async iterable of arrays of the given size.
 */
export function opBufferAsync<T>(size: number): (iter: AsyncIterable<T>) => AsyncIterable<T[]> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        let buffer: T[] = [];
        for await (const v of iter) {
            buffer.push(v);
            if (buffer.length >= size) {
                yield buffer;
                buffer = [];
            }
        }

        if (buffer.length) {
            yield buffer;
        }
    }

    return fn;
}

/**
 * @param size - The size of the buffer.
 * @returns A function that takes an iterable and returns an iterable of arrays of the given size.
 */
export function opBufferSync<T>(size: number): (iter: Iterable<T>) => Iterable<T[]> {
    function* fn(iter: Iterable<T>) {
        let buffer: T[] = [];
        for (const v of iter) {
            buffer.push(v);
            if (buffer.length >= size) {
                yield buffer;
                buffer = [];
            }
        }

        if (buffer.length) {
            yield buffer;
        }
    }

    return fn;
}

export function opBuffer<T>(size: number): PipeFn<T, T[]> {
    const asyncFn = opBufferAsync<T>(size);
    const syncFn = opBufferSync<T>(size);

    function _(i: Iterable<T>): Iterable<T[]>;
    function _(i: AsyncIterable<T>): AsyncIterable<T[]>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<T[]> | AsyncIterable<T[]> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
