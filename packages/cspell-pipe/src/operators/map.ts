import { toPipeFn } from '../helpers/util.js';

export function opMapAsync<T, U = T>(mapFn: (v: T) => U): (iter: AsyncIterable<T>) => AsyncIterable<U> {
    async function* genMap(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            yield mapFn(v);
        }
    }

    return genMap;
}

export function _opMapSync<T, U = T>(mapFn: (v: T) => U): (iter: Iterable<T>) => Iterable<U> {
    function* genMap(iter: Iterable<T>) {
        for (const v of iter) {
            yield mapFn(v);
        }
    }
    return genMap;
}

export function opMapSync<T, U = T>(mapFn: (v: T) => U): (iterable: Iterable<T>) => Iterable<U> {
    function opMapIterable(iterable: Iterable<T>) {
        function opMapIterator() {
            const iter = iterable[Symbol.iterator]();
            function nextOpMap() {
                const { done, value } = iter.next();
                if (done) return { done, value: undefined };
                return { value: mapFn(value) };
            }
            return {
                next: nextOpMap,
            };
        }
        return {
            [Symbol.iterator]: opMapIterator,
        };
    }
    return opMapIterable;
}

export const opMap = <T, U>(fn: (v: T) => U) => toPipeFn(opMapSync(fn), opMapAsync(fn));
