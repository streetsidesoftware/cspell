import { toPipeFn } from '../helpers/util';

export function opSkipAsync<T>(count: number): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T> {
    async function* fn(iter: AsyncIterable<T> | Iterable<T>) {
        for await (const v of iter) {
            if (count > 0) {
                --count;
                continue;
            }
            yield v;
        }
    }

    return fn;
}

export function opSkipSync<T>(count: number): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            if (count > 0) {
                --count;
                continue;
            }
            yield v;
        }
    }

    return fn;
}

export const opSkip = <T>(count: number) => toPipeFn(opSkipSync<T>(count), opSkipAsync<T>(count));
