import { isAsyncIterable } from './util';

export function toArray<T>(i: AsyncIterable<T>): Promise<Awaited<T>[]>;
export function toArray<T>(i: Iterable<T>): T[];
export function toArray<T>(i: Iterable<T> | AsyncIterable<T>): T[] | Promise<Awaited<T>[]>;
export function toArray<T>(i: Iterable<T> | AsyncIterable<T>): T[] | Promise<Awaited<T>[]> {
    return isAsyncIterable(i) ? toArrayAsync(i) : toArraySync(i);
}

export function toArraySync<T>(iter: Iterable<T>): T[] {
    return [...iter];
}

export async function toArrayAsync<T>(iter: AsyncIterable<T>): Promise<Awaited<T>[]> {
    const collection: Awaited<T>[] = [];
    for await (const i of iter) {
        collection.push(i);
    }
    return collection;
}
