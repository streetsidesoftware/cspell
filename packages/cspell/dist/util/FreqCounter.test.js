"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const FreqCounter_1 = require("./FreqCounter");
describe('Validate FreqCounter', () => {
    it('Test Creating an empty Counter', () => {
        const counter = FreqCounter_1.FreqCounter.create();
        chai_1.expect(counter).to.be.instanceof(FreqCounter_1.FreqCounter);
        chai_1.expect(counter.total).to.be.equal(0);
        chai_1.expect(counter.getFreq(1)).to.be.equal(0);
        chai_1.expect(counter.counters).to.be.instanceof(Map);
    });
    it('Test Adding values to a counter', () => {
        const counter = FreqCounter_1.FreqCounter.create([1, 1, 2, 3]);
        chai_1.expect(counter.total).to.be.equal(4);
        chai_1.expect(counter.getCount(1)).to.be.equal(2);
        chai_1.expect(counter.getCount(2)).to.be.equal(1);
        chai_1.expect(counter.getFreq(1)).to.be.equal(0.5);
    });
    it('Test merging counters', () => {
        const counter = FreqCounter_1.FreqCounter.create([1, 1, 2, 3]);
        const counter2 = FreqCounter_1.FreqCounter.create([1, 2, 2, 3, 3]);
        chai_1.expect(counter.total).to.be.equal(4);
        chai_1.expect(counter2.total).to.be.equal(5);
        counter.merge(counter2, counter2);
        chai_1.expect(counter.total).to.be.equal(14);
        chai_1.expect(counter.getCount(1)).to.be.equal(4);
    });
});
//# sourceMappingURL=FreqCounter.test.js.map