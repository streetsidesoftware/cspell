"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const util = require("./util");
describe('Validate util', () => {
    it('tests uniqueFilterFnGenerator', () => {
        const values = [1, 2, 4, 5, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8];
        const uniqFilter = util.uniqueFilterFnGenerator();
        chai_1.expect(values.filter(uniqFilter).sort()).to.be.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
    });
    it('tests uniqueFilterFnGenerator with extractor', () => {
        const values = [{ word: 'hello' }, { word: 'there' }, { word: 'hello' }];
        const uniqFilter = util.uniqueFilterFnGenerator((w) => w.word);
        chai_1.expect(values.filter(uniqFilter)).to.be.deep.equal([values[0], values[1]]);
    });
    it('tests unique', () => {
        chai_1.expect(util.unique([])).to.be.deep.equal([]);
        chai_1.expect(util.unique([4, 3, 2, 1])).to.be.deep.equal([4, 3, 2, 1]);
        chai_1.expect(util.unique([4, 4, 3, 2, 3, 1, 2])).to.be.deep.equal([4, 3, 2, 1]);
    });
    it('tests clean up obj', () => {
        const obj = {
            a: undefined, b: 1, c: true, d: undefined, e: 'str'
        };
        const cleanObj = util.clean(obj);
        chai_1.expect([...Object.keys(cleanObj)]).to.be.deep.equal(['b', 'c', 'e']);
    });
});
//# sourceMappingURL=util.test.js.map