import { isAsyncIterable } from '../helpers/util.js';
import type { PipeFn } from '../internalTypes.js';

// prettier-ignore
export function opFirstAsync<T, S extends T>(firstFn: (v: T) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opFirstAsync<T, S extends Awaited<T>>(firstFn: (v: Awaited<T>) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opFirstAsync<T>(firstFn: (v: Awaited<T>) => boolean): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opFirstAsync<T>(firstFn: (v: Awaited<T>) => Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opFirstAsync<T>(firstFn: (v: Awaited<T>) => boolean | Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            const pass = await firstFn(v);
            if (pass) {
                yield v;
                break;
            }
        }
    }

    return fn;
}

export function opFirstSync<T, S extends T>(firstFn: (v: T) => v is S): (iter: Iterable<T>) => Iterable<S>;
export function opFirstSync<T>(firstFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T>;
export function opFirstSync<T>(firstFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            if (firstFn(v)) {
                yield v;
                break;
            }
        }
    }

    return fn;
}

export function opFirst<T, S extends T>(fn: (v: T) => v is S): PipeFn<T, S>;
export function opFirst<T>(fn: (v: T) => boolean): PipeFn<T, T>;
export function opFirst<T>(fn: (v: T) => boolean): PipeFn<T, T> {
    const asyncFn = opFirstAsync(fn);
    const syncFn = opFirstSync(fn);

    function _(i: Iterable<T>): Iterable<T>;
    function _(i: AsyncIterable<T>): AsyncIterable<T>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<T> | AsyncIterable<T> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
