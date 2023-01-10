import { toPipeFn } from '../helpers/util.js';

export function opConcatMapAsync<T, U = T>(
    mapFn: (v: T) => AsyncIterable<U> | Iterable<U>
): (iter: AsyncIterable<T>) => AsyncIterable<U> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            yield* mapFn(v);
        }
    }

    return fn;
}

export function opConcatMapSync<T, U = T>(mapFn: (v: T) => Iterable<U>): (iter: Iterable<T>) => Iterable<U> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            yield* mapFn(v);
        }
    }
    return fn;
}

export const opConcatMap = <T, U>(fn: (v: T) => Iterable<U>) => toPipeFn(opConcatMapSync(fn), opConcatMapAsync(fn));
