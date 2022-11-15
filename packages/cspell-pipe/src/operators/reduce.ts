import { asyncIteratorToAsyncIterable, iteratorToIterable } from '../helpers';

export function opReduceAsync<T>(
    reduceFn: (previousValue: T, currentValue: T) => T
): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T>;
export function opReduceAsync<T>(
    reduceFn: (previousValue: T, currentValue: T) => T,
    initialValue: T | Promise<T>
): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T>;
export function opReduceAsync<T, U>(
    reduceFn: (previousValue: U, currentValue: T) => U,
    initialValue: U | Promise<U>
): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<U>;
export function opReduceAsync<T>(
    reduceFn: (p: T, c: T) => T,
    initialValue?: T | Promise<T>
): (iter: AsyncIterable<T> | Iterable<T>) => AsyncIterable<T> {
    async function* reduce(head: T, tail: AsyncIterable<T> | Iterable<T>) {
        for await (const v of tail) {
            head = reduceFn(head, v);
        }
        yield head;
    }

    async function* fn(iter: AsyncIterable<T> | Iterable<T>) {
        const ht = initialValue !== undefined ? { head: await initialValue, tail: iter } : await headTailAsync(iter);
        if (!ht) return;
        yield* reduce(ht.head, ht.tail);
    }
    return fn;
}

export function opReduceSync<T>(reduceFn: (previousValue: T, currentValue: T) => T): (iter: Iterable<T>) => Iterable<T>;
export function opReduceSync<T>(
    reduceFn: (previousValue: T, currentValue: T) => T,
    initialValue: T
): (iter: Iterable<T>) => Iterable<T>;
export function opReduceSync<T, U>(
    reduceFn: (previousValue: U, currentValue: T) => U,
    initialValue: U
): (iter: Iterable<T>) => Iterable<U>;
export function opReduceSync<T>(reduceFn: (p: T, c: T) => T, initialValue?: T): (iter: Iterable<T>) => Iterable<T> {
    function* reduce(head: T, tail: Iterable<T>) {
        for (const v of tail) {
            head = reduceFn(head, v);
        }
        yield head;
    }

    function* fn(iter: Iterable<T>) {
        const ht = initialValue !== undefined ? { head: initialValue, tail: iter } : headTail(iter);
        if (!ht) return;
        yield* reduce(ht.head, ht.tail);
    }
    return fn;
}

function headTail<T>(iter: Iterable<T>): { head: T; tail: Iterable<T> } | undefined {
    const iterator = iter[Symbol.iterator]();
    const first = iterator.next();
    if (first.done) return undefined;

    return { head: first.value, tail: iteratorToIterable(iterator) };
}

async function headTailAsync<T>(
    iter: AsyncIterable<T> | Iterable<T>
): Promise<{ head: T; tail: AsyncIterable<T> } | undefined> {
    const iterator = isIterable(iter) ? iter[Symbol.iterator]() : iter[Symbol.asyncIterator]();
    const first = await iterator.next();
    if (first.done) return undefined;

    return { head: first.value, tail: asyncIteratorToAsyncIterable(iterator) };
}

function isIterable<T>(i: Iterable<T> | AsyncIterable<T>): i is Iterable<T> {
    return typeof (<Iterable<T>>i)[Symbol.iterator] === 'function';
}
