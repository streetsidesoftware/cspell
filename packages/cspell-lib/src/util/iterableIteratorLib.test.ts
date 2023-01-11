import { concatIterables, toIterableIterator } from './iterableIteratorLib';

describe('Validate Iterable Iterators', () => {
    test('toIterableIterator', () => {
        const values = [1, 2, 3, 4];
        expect(toIterableIterator(values)).not.toBe(values);
        expect([...toIterableIterator(values)]).toEqual(values);
    });

    test('concatIterables', () => {
        const values = [[1, 2, 3], toIterableIterator([4, 5, 6]), new Set([7, 8, 9])];
        expect([...concatIterables(...values)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});
