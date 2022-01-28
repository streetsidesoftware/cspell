import { toPipeFn } from '../helpers/util';

export function asyncMap<T, U = T>(mapFn: (v: T) => U): (iter: AsyncIterable<T>) => AsyncIterable<U> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            yield mapFn(v);
        }
    }

    return fn;
}

export function syncMap<T, U = T>(mapFn: (v: T) => U): (iter: Iterable<T>) => Iterable<U> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            yield mapFn(v);
        }
    }
    return fn;
}

export const map = <T, U>(fn: (v: T) => U) => toPipeFn(syncMap(fn), asyncMap(fn));
