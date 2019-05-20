import {expect} from 'chai';
import {FreqCounter} from './FreqCounter';

describe('Validate FreqCounter', () => {
    it('Test Creating an empty Counter', () => {
        const counter = FreqCounter.create();
        expect(counter).to.be.instanceof(FreqCounter);
        expect(counter.total).to.be.equal(0);
        expect(counter.getFreq(1)).to.be.equal(0);
        expect(counter.counters).to.be.instanceof(Map);
    });
    it('Test Adding values to a counter', () => {
        const counter = FreqCounter.create([1, 1, 2, 3]);
        expect(counter.total).to.be.equal(4);
        expect(counter.getCount(1)).to.be.equal(2);
        expect(counter.getCount(2)).to.be.equal(1);
        expect(counter.getFreq(1)).to.be.equal(0.5);
    });
    it('Test merging counters', () => {
        const counter = FreqCounter.create([1, 1, 2, 3]);
        const counter2 = FreqCounter.create([1, 2, 2, 3, 3]);
        expect(counter.total).to.be.equal(4);
        expect(counter2.total).to.be.equal(5);
        counter.merge(counter2, counter2);
        expect(counter.total).to.be.equal(14);
        expect(counter.getCount(1)).to.be.equal(4);
    });
});
