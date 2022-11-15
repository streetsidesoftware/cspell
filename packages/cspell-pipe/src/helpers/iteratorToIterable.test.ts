import { asyncIteratorToAsyncIterable, iteratorToIterable } from './iteratorToIterable';
import { opFlattenSync } from '../operators/flatten';
import { toArrayAsync } from './toArray';

describe('iteratorToIterable', () => {
    test.each`
        value                                    | expected
        ${[]}                                    | ${[]}
        ${[1, 2, 3]}                             | ${[1, 2, 3]}
        ${yieldAll([1, 2, 3])}                   | ${[1, 2, 3]}
        ${yieldAll([], [1], [2], yieldAll([3]))} | ${[1, 2, 3]}
    `('iteratorToIterable $value', ({ value, expected }) => {
        expect([...iteratorToIterable(toIterator(value))]).toEqual(expected);
    });

    test.each`
        value                                    | expected
        ${[]}                                    | ${[]}
        ${[1, 2, 3]}                             | ${[1, 2, 3]}
        ${yieldAll([1, 2, 3])}                   | ${[1, 2, 3]}
        ${yieldAll([], [1], [2], yieldAll([3]))} | ${[1, 2, 3]}
    `('asyncIteratorToAsyncIterable $value', async ({ value, expected }) => {
        expect([...(await toArrayAsync(asyncIteratorToAsyncIterable(toAsyncIterator(value))))]).toEqual(expected);
    });
});

function yieldAll<T>(...values: Iterable<T>[]): Iterable<T> {
    const flatten = opFlattenSync<T>();
    return flatten(values);
}

function toIterator<T>(i: IterableIterator<T> | Iterable<T>): Iterator<T> {
    return i[Symbol.iterator]();
}

function toAsyncIterator<T>(i: IterableIterator<T> | Iterable<T>): AsyncIterator<T> {
    async function* all() {
        yield* i;
    }
    return all();
}
