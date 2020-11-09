import * as search from './search';

describe('validate the search', () => {
    test('the results of binary search', () => {
        expect(search.binarySearch([], 5)).toEqual(0);
        expect(search.binarySearch([1, 3, 7, 11], 5)).toEqual(2);
        expect(search.binarySearch([1, 3, 7, 11], 1)).toEqual(0);
        expect(search.binarySearch([1, 3, 7, 11], 0)).toEqual(0);
        expect(search.binarySearch([1, 3, 7, 11], 11)).toEqual(3);
        expect(search.binarySearch([1, 3, 7, 11], 3)).toEqual(1);
        expect(search.binarySearch([1, 3, 7, 11], 22)).toEqual(4);
    });
});
