import {expect} from 'chai';
import { uniqueFilter, hrTimeToSeconds, batch } from './util';

describe('Test util functions', () => {

    it('Test hrTimeToSeconds', () => {
        expect(hrTimeToSeconds([5, 6])).to.be.equal(5.000000006);
    });

    it('Tests uniqueFilter', () => {
        expect([1, 2, 1, 3, 4, 5, 3, 4, 2, 3].filter(uniqueFilter(3))).to.be.deep.equal([1, 2, 3, 4, 5, 2]);
    });

    it('Tests batch', () => {
        expect([...batch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3)]).to.be.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11]]);
        expect([...batch([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)]).to.be.deep.equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });
});
