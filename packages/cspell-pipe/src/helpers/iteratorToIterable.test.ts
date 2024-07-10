import { describe, expect, test } from 'vitest';

import { opFlattenSync } from '../operators/flatten.js';
import { generatorTestWrapper, makeIterableTestWrapperOptions } from '../test/iterableTestWrapper.js';
import { throwAfter, throwAfterAsync } from '../test/throwAfter.js';
import { asyncIteratorToAsyncIterable, iteratorToIterable } from './iteratorToIterable.js';
import { toArrayAsync } from './toArray.js';

describe('iteratorToIterable sync', () => {
    test.each`
        value                                    | expected
        ${[]}                                    | ${[]}
        ${[1, 2, 3]}                             | ${[1, 2, 3]}
        ${yieldAll([1, 2, 3])}                   | ${[1, 2, 3]}
        ${yieldAll([], [1], [2], yieldAll([3]))} | ${[1, 2, 3]}
    `('iteratorToIterable $value', ({ value, expected }) => {
        expect([...iteratorToIterable(toIterator(value))]).toEqual(expected);
    });

    test('sync return', () => {
        const options = makeIterableTestWrapperOptions();

        const t = generatorTestWrapper([1, 2, 3], options);
        expect([...iteratorToIterable(t[Symbol.iterator]())]).toEqual([1, 2, 3]);
        expect(options.nextCalled).toHaveBeenCalledTimes(4);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('sync throw', () => {
        const options = makeIterableTestWrapperOptions();

        const g = throwAfter(
            iteratorToIterable(generatorTestWrapper([1, 2, 3, 4, 5], options)[Symbol.iterator]()),
            3,
            'my error',
        );
        expect(() => [...g]).toThrow('my error');
        expect(options.nextCalled).toHaveBeenCalledTimes(3);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(1);
    });
});

describe('iteratorToIterable async', () => {
    test('async return', async () => {
        const options = makeIterableTestWrapperOptions();

        const t = generatorTestWrapper([1, 2, 3], options);
        expect([...(await toArrayAsync(asyncIteratorToAsyncIterable(t[Symbol.iterator]())))]).toEqual([1, 2, 3]);
        expect(options.nextCalled).toHaveBeenCalledTimes(4);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
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

    test('async no throw', async () => {
        const options = makeIterableTestWrapperOptions();

        const t = generatorTestWrapper([1, 2, 3, 4, 5], options);
        const g = throwAfterAsync(asyncIteratorToAsyncIterable(toAsyncIterator(t)), 8, 'my error');
        await expect(toArrayAsync(g)).resolves.toEqual([1, 2, 3, 4, 5]);
        expect(options.nextCalled).toHaveBeenCalledTimes(6);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('async throw', async () => {
        const options = makeIterableTestWrapperOptions();

        const t = generatorTestWrapper([1, 2, 3, 4, 5], options);
        const g = throwAfterAsync(asyncIteratorToAsyncIterable(toAsyncIterator(t)), 3, 'my error');
        await expect(toArrayAsync(g)).rejects.toThrow('my error');
        expect(options.nextCalled).toHaveBeenCalledTimes(3);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(1);
    });
});

function yieldAll<T>(...values: Iterable<T>[]): Iterable<T> {
    const flatten = opFlattenSync<T>();
    return flatten(values);
}

function toIterator<T>(i: IterableIterator<T> | Iterable<T>): Iterator<T> {
    return i[Symbol.iterator]();
}

async function* toAsyncIterable<T>(i: Iterable<T> | AsyncIterable<T>): AsyncIterable<T> {
    yield* i;
}

function toAsyncIterator<T>(i: IterableIterator<T> | Iterable<T>): AsyncIterator<T> {
    return toAsyncIterable(i)[Symbol.asyncIterator]();
}
