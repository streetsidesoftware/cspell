"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextRange = require("./TextRange");
const chai_1 = require("chai");
describe('Util Text', () => {
    it('tests unionRanges', () => {
        const result1 = TextRange.unionRanges([]);
        chai_1.expect(result1).to.deep.equal([]);
        const result2 = TextRange.unionRanges([{ startPos: 0, endPos: 10 }]);
        chai_1.expect(result2).to.deep.equal([{ startPos: 0, endPos: 10 }]);
        const result3 = TextRange.unionRanges([{ startPos: 0, endPos: 10 }, { startPos: 0, endPos: 10 }]);
        chai_1.expect(result3).to.deep.equal([{ startPos: 0, endPos: 10 }]);
        const result4 = TextRange.unionRanges([{ startPos: 5, endPos: 15 }, { startPos: 0, endPos: 10 }]);
        chai_1.expect(result4).to.deep.equal([{ startPos: 0, endPos: 15 }]);
        const result5 = TextRange.unionRanges([{ startPos: 11, endPos: 15 }, { startPos: 0, endPos: 10 }]);
        chai_1.expect(result5).to.deep.equal([{ startPos: 0, endPos: 10 }, { startPos: 11, endPos: 15 }]);
        const result6 = TextRange.unionRanges([{ startPos: 10, endPos: 15 }, { startPos: 0, endPos: 10 }]);
        chai_1.expect(result6).to.deep.equal([{ startPos: 0, endPos: 15 }]);
    });
});
//# sourceMappingURL=TextRange.test.js.map