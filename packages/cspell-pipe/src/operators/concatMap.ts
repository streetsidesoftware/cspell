import { toPipeFn } from '../helpers/util.js';

export function opConcatMapAsync<T, U = T>(
    mapFn: (v: T) => AsyncIterable<U> | Iterable<U>,
): (iter: AsyncIterable<T>) => AsyncIterable<U> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            yield* mapFn(v);
        }
    }

    return fn;
}

export function opConcatMapSync<T, U = T>(mapFn: (v: T) => Iterable<U>): (iter: Iterable<T>) => Iterable<U> {
    function fnConcatMapSync(iterable: Iterable<T>): Iterable<U> {
        function opConcatMapIterator() {
            const iter = iterable[Symbol.iterator]();
            let resultsIter: Iterator<U> | undefined = undefined;
            function nextConcatMap() {
                while (true) {
                    if (resultsIter) {
                        const { done, value } = resultsIter.next();
                        if (!done) {
                            return { value };
                        }
                        resultsIter = undefined;
                    }
                    const { done, value } = iter.next();
                    if (done) {
                        return { done, value: undefined };
                    }
                    resultsIter = mapFn(value)[Symbol.iterator]();
                }
            }
            return {
                next: nextConcatMap,
            };
        }
        return {
            [Symbol.iterator]: opConcatMapIterator,
        };
    }
    return fnConcatMapSync;
}

export function _opConcatMapSync<T, U = T>(mapFn: (v: T) => Iterable<U>): (iter: Iterable<T>) => Iterable<U> {
    function* fnConcatMapSync(iter: Iterable<T>) {
        for (const v of iter) {
            yield* mapFn(v);
        }
    }
    return fnConcatMapSync;
}

export const opConcatMap = <T, U>(fn: (v: T) => Iterable<U>) => toPipeFn(opConcatMapSync(fn), opConcatMapAsync(fn));
