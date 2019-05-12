"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const search = require("./search");
describe('validate the search', () => {
    it('test the results of binary search', () => {
        chai_1.expect(search.binarySearch([], 5)).to.be.equal(0);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 5)).to.be.equal(2);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 1)).to.be.equal(0);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 0)).to.be.equal(0);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 11)).to.be.equal(3);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 3)).to.be.equal(1);
        chai_1.expect(search.binarySearch([1, 3, 7, 11], 22)).to.be.equal(4);
    });
});
//# sourceMappingURL=search.test.js.map