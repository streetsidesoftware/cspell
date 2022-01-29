import { toPipeFn } from '../helpers/util';

export function opFilterAsync<T>(filterFn: (v: T) => boolean): (iter: AsyncIterable<T>) => AsyncIterable<T> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            if (filterFn(v)) yield v;
        }
    }

    return fn;
}

export function opFilterSync<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            if (filterFn(v)) yield v;
        }
    }

    return fn;
}

export const opFilter = <T>(fn: (i: T) => boolean) => toPipeFn(opFilterSync(fn), opFilterAsync(fn));
