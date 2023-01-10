import { toPipeFn } from '../helpers/util.js';

export function opUniqueAsync<T, U>(k?: (v: T) => U): (iter: AsyncIterable<T>) => AsyncIterable<T> {
    function fnK(k: (v: T) => U) {
        async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
            const s = new Set<U>();
            for await (const v of iter) {
                const kk = k(v);
                if (s.has(kk)) continue;
                s.add(kk);
                yield v;
            }
        }
        return fn;
    }

    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        const s = new Set<T>();
        for await (const v of iter) {
            if (s.has(v)) continue;
            s.add(v);
            yield v;
        }
    }

    return k ? fnK(k) : fn;
}

export function opUniqueSync<T, U>(k?: (v: T) => U): (iter: Iterable<T>) => Iterable<T> {
    function fnK(key: (v: T) => U) {
        function* fn(iter: Iterable<T>) {
            const s = new Set<U>();
            for (const v of iter) {
                const kk = key(v);
                if (s.has(kk)) continue;
                s.add(kk);
                yield v;
            }
        }
        return fn;
    }

    function* fn(iter: Iterable<T>) {
        const s = new Set<T>();
        for (const v of iter) {
            if (s.has(v)) continue;
            s.add(v);
            yield v;
        }
    }

    return k ? fnK(k) : fn;
}

export const opUnique = <T, U = T>(getKey?: (v: T) => U) =>
    toPipeFn(opUniqueSync<T, U>(getKey), opUniqueAsync<T, U>(getKey));
