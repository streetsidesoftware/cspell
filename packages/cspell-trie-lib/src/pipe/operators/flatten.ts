import { toPipeFn } from '../helpers/util';

export function asyncFlatten<T>(): (iter: AsyncIterable<AsyncIterable<T> | Iterable<T>>) => AsyncIterable<T> {
    async function* fn(iter: Iterable<Iterable<T>> | AsyncIterable<AsyncIterable<T> | Iterable<T>>) {
        for await (const v of iter) {
            yield* v;
        }
    }

    return fn;
}

export function syncFlatten<T>(): (iter: Iterable<Iterable<T>>) => Iterable<T> {
    function* fn(iter: Iterable<Iterable<T>>) {
        for (const v of iter) {
            yield* v;
        }
    }

    return fn;
}

export const flatten = <T>() => toPipeFn(syncFlatten<T>(), asyncFlatten<T>());
