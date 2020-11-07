import * as search from './search';

describe('validate the search', () => {
    test('the results of binary search', () => {
        expect(search.binarySearch([], 5)).toBe(0);
        expect(search.binarySearch([1, 3, 7, 11], 5)).toBe(2);
        expect(search.binarySearch([1, 3, 7, 11], 1)).toBe(0);
        expect(search.binarySearch([1, 3, 7, 11], 0)).toBe(0);
        expect(search.binarySearch([1, 3, 7, 11], 11)).toBe(3);
        expect(search.binarySearch([1, 3, 7, 11], 3)).toBe(1);
        expect(search.binarySearch([1, 3, 7, 11], 22)).toBe(4);
    });
});
