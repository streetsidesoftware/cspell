import { isAsyncIterable } from '../helpers/util.js';
import type { PipeFn } from '../internalTypes.js';

// prettier-ignore
export function opFilterAsync<T, S extends T>(filterFn: (v: T) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opFilterAsync<T, S extends Awaited<T>>(filterFn: (v: Awaited<T>) => v is S): (iter: AsyncIterable<T>) => AsyncIterable<S>;
// prettier-ignore
export function opFilterAsync<T>(filterFn: (v: Awaited<T>) => boolean): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opFilterAsync<T>(filterFn: (v: Awaited<T>) => Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>>;
// prettier-ignore
export function opFilterAsync<T>(filterFn: (v: Awaited<T>) => boolean | Promise<boolean>): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>> {
    async function* genFilter(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            const pass = await filterFn(v);
            if (pass) yield v;
        }
    }

    return genFilter;
}

export function opFilterSync<T, S extends T>(filterFn: (v: T) => v is S): (iter: Iterable<T>) => Iterable<S>;
export function opFilterSync<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T>;
export function opFilterSync<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function opFilterIterable(iterable: Iterable<T>) {
        function opFilterIterator() {
            const iter = iterable[Symbol.iterator]();
            function nextOpFilter() {
                while (true) {
                    const { done, value } = iter.next();
                    if (done) return { done, value: undefined };
                    if (filterFn(value)) return { value };
                }
            }
            return {
                next: nextOpFilter,
            };
        }
        return {
            [Symbol.iterator]: opFilterIterator,
        };
    }
    return opFilterIterable;
}

export function _opFilterSync<T, S extends T>(filterFn: (v: T) => v is S): (iter: Iterable<T>) => Iterable<S>;
export function _opFilterSync<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T>;
export function _opFilterSync<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function* genFilter(iter: Iterable<T>) {
        for (const v of iter) {
            if (filterFn(v)) yield v;
        }
    }

    return genFilter;
}

export function opFilter<T, S extends T>(fn: (v: T) => v is S): PipeFn<T, S>;
export function opFilter<T>(fn: (v: T) => boolean): PipeFn<T, T>;
export function opFilter<T>(fn: (v: T) => boolean): PipeFn<T, T> {
    const asyncFn = opFilterAsync(fn);
    const syncFn = opFilterSync(fn);

    function _(i: Iterable<T>): Iterable<T>;
    function _(i: AsyncIterable<T>): AsyncIterable<T>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<T> | AsyncIterable<T> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}
