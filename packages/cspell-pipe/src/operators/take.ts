import { toPipeFn } from '../helpers/util';

export function opTakeAsync<T>(count: number): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T> {
    async function* fn(iter: AsyncIterable<T> | Iterable<T>) {
        if (count <= 0) return;
        for await (const v of iter) {
            yield v;
            if (--count <= 0) return;
        }
    }

    return fn;
}

export function opTakeSync<T>(count: number): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        if (count <= 0) return;
        for (const v of iter) {
            yield v;
            if (--count <= 0) return;
        }
    }

    return fn;
}

/**
 * Consume only the first `count` number from the iterable.
 * @param count - number to take
 */
export const opTake = <T>(count: number) => toPipeFn(opTakeSync<T>(count), opTakeAsync<T>(count));
