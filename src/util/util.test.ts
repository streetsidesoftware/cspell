import {expect} from 'chai';
import * as util from './util';

describe('Validate util', () => {
    it('tests uniqueFilterFnGenerator', () => {
        const values = [1, 2, 4, 5, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8];
        const uniqFilter = util.uniqueFilterFnGenerator<number>();
        expect(values.filter(uniqFilter).sort()).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('tests uniqueFilterFnGenerator with extractor', () => {
        interface Word { word: string; };
        const values: Word[] = [{ word: 'hello'}, {word: 'there'}, {word: 'hello'}];
        const uniqFilter = util.uniqueFilterFnGenerator((w: Word) => w.word);
        expect(values.filter(uniqFilter)).to.be.deep.equal([values[0], values[1]]);
    });
});
