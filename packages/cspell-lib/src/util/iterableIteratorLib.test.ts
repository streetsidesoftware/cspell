import {expect} from 'chai';
import { toIterableIterator, concatIterables } from './iterableIteratorLib';

describe('Validate Iterable Iterators', () => {
    it('test toIterableIterator', () => {
        const values = [1, 2, 3, 4];
        expect(toIterableIterator(values)).to.not.equal(values);
        expect([...toIterableIterator(values)]).to.deep.equal(values);
    });

    it('test concatIterables', () => {
        const values = [
            [1, 2, 3],
            toIterableIterator([4, 5, 6]),
            new Set([7, 8, 9])
        ];
        expect([...concatIterables(...values)]).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});
