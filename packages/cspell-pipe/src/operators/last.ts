import { isAsyncIterable } from '../helpers/util';
import { PipeFn } from '../internalTypes';

const symNotFound = Symbol('LastNotFound');

// prettier-ignore
export function opLastAsync<T, S extends T>(lastFn: (v: T) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opLastAsync<T, S extends Awaited<T>>(lastFn: (v: Awaited<T>) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opLastAsync<T>(lastFn: (v: Awaited<T>) => boolean): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opLastAsync<T>(lastFn: (v: Awaited<T>) => Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opLastAsync<T>(lastFn: (v: Awaited<T>) => boolean | Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        let last: T | typeof symNotFound = symNotFound;
        for await (const v of iter) {
            const pass = await lastFn(v);
            if (pass) {
                last = v;
            }
        }
        if (last !== symNotFound) yield last;
    }

    return fn;
}

export function opLastSync<T, S extends T>(lastFn: (v: T) => v is S): (iter: Iterable<T>) => Iterable<S>;
export function opLastSync<T>(lastFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T>;
export function opLastSync<T>(lastFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        let last: T | typeof symNotFound = symNotFound;
        for (const v of iter) {
            if (lastFn(v)) {
                last = v;
            }
        }
        if (last !== symNotFound) yield last;
    }

    return fn;
}

export function opLast<T, S extends T>(fn: (v: T) => v is S): PipeFn<T, S>;
export function opLast<T>(fn: (v: T) => boolean): PipeFn<T, T>;
export function opLast<T>(fn: (v: T) => boolean): PipeFn<T, T> {
    const asyncFn = opLastAsync(fn);
    const syncFn = opLastSync(fn);

    function _(i: Iterable<T>): Iterable<T>;
    function _(i: AsyncIterable<T>): AsyncIterable<T>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<T> | AsyncIterable<T> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
