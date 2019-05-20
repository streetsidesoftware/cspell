import {expect} from 'chai';
import * as search from './search';

describe('validate the search', () => {
    it('test the results of binary search', () => {
        expect(search.binarySearch([], 5)).to.be.equal(0);
        expect(search.binarySearch([1, 3, 7, 11], 5)).to.be.equal(2);
        expect(search.binarySearch([1, 3, 7, 11], 1)).to.be.equal(0);
        expect(search.binarySearch([1, 3, 7, 11], 0)).to.be.equal(0);
        expect(search.binarySearch([1, 3, 7, 11], 11)).to.be.equal(3);
        expect(search.binarySearch([1, 3, 7, 11], 3)).to.be.equal(1);
        expect(search.binarySearch([1, 3, 7, 11], 22)).to.be.equal(4);
    });
});
