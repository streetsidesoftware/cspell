import { batch, filterOrderedList, hrTimeToSeconds, uniqueFilter } from './util';

describe('Test util functions', () => {
    it('Test hrTimeToSeconds', () => {
        expect(hrTimeToSeconds([5, 6])).toBe(5.000000006);
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
});
