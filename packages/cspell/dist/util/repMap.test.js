"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const repMap = require("./repMap");
describe('ReMap Tests', () => {
    it('test basic replace', () => {
        const mapper = repMap.createMapper([]);
        chai_1.expect(mapper('hello')).to.be.equal('hello');
    });
    it('test basic replace', () => {
        const mapper = repMap.createMapper([['`', "'"]]);
        chai_1.expect(mapper('hello')).to.be.equal('hello');
        chai_1.expect(mapper('don`t')).to.be.equal("don't");
    });
    it('test multiple replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B']]);
        chai_1.expect(mapper('apple')).to.be.equal('Apple');
        chai_1.expect(mapper('banana')).to.be.equal('BAnAnA');
    });
    it('test empty replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['b', 'B'], ['', '']]);
        chai_1.expect(mapper('apple')).to.be.equal('Apple');
        chai_1.expect(mapper('banana')).to.be.equal('BAnAnA');
    });
    it('test regex replacements', () => {
        const mapper = repMap.createMapper([['!|@|#|\\$', '_'], ['a', 'A']]);
        chai_1.expect(mapper('$apple!!')).to.be.equal('_Apple__');
    });
    it('test repeated replacements', () => {
        const mapper = repMap.createMapper([['a', 'A'], ['a', 'X']]);
        chai_1.expect(mapper('apples')).to.be.equal('Apples');
    });
    it('test nested regex replacements', () => {
        const mapper = repMap.createMapper([['(!)', '_'], ['((\\$))', '#'], ['a', 'A']]);
        chai_1.expect(mapper('$apple!!')).to.be.equal('#Apple__');
    });
    it('test bad regex replacements', () => {
        const mapper = repMap.createMapper([['(', '_'], ['a', 'A']]);
        chai_1.expect(mapper('(apple)')).to.be.equal('_Apple)');
    });
    it('test empty regex replacements', () => {
        const mapper = repMap.createMapper([['', '_'], ['a', 'A']]);
        chai_1.expect(mapper('(apple)')).to.be.equal('(Apple)');
    });
});
//# sourceMappingURL=repMap.test.js.map