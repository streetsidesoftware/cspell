import { describe, expect, it, test } from 'vitest';

import {
    batch,
    filterOrderedList,
    groupByField,
    hrTimeToSeconds,
    insertItemIntoGroupByField,
    uniqueFilter,
} from './util.js';

describe('Test util functions', () => {
    it('Test hrTimeToSeconds', () => {
        expect(hrTimeToSeconds([5, 6])).toBe(5.000_000_006);
    });

    it('Tests uniqueFilter', () => {
        // prettier-ignore
        expect([1, 2, 1, 3, 4, 5, 3, 4, 2, 3].filter(uniqueFilter(3))).toEqual([1, 2, 3, 4, 5, 2]);
    });

    it('Tests batch', () => {
        // prettier-ignore
        expect([...batch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3)]).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11]]);
        // prettier-ignore
        expect([...batch([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)]).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('Tests filterOrderedList', () => {
        // prettier-ignore
        expect([1, 1, 2, 2, 3, 2, 4, 4, 5, 5, 5].filter(filterOrderedList((a, b) => a !== b))).toEqual([1, 2, 3, 2, 4, 5]);
    });

    test('groupByField', () => {
        const r = groupByField(
            [{ a: 1, b: 0 }, { a: 2 }, { a: 1, b: 1 }, { a: 3 }, { a: 2, b: 1 }, { a: 1, b: 2 }],
            'a',
        );
        expect(r).toEqual(
            new Map([
                [
                    1,
                    [
                        { a: 1, b: 0 },
                        { a: 1, b: 1 },
                        { a: 1, b: 2 },
                    ],
                ],
                [2, [{ a: 2 }, { a: 2, b: 1 }]],
                [3, [{ a: 3 }]],
            ]),
        );
    });

    test('insertItemIntoGroupByField', () => {
        const map = new Map<number, { a: number; b?: number }[]>();
        const values = [{ a: 1, b: 0 }, { a: 2 }, { a: 1, b: 1 }, { a: 3 }, { a: 2, b: 1 }, { a: 1, b: 2 }];
        for (const value of values) {
            insertItemIntoGroupByField(map, 'a', value);
        }
        expect(map).toEqual(groupByField(values, 'a'));
    });
});
