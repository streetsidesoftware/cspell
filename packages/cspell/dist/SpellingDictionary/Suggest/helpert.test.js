"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const helpers = require("./helpers");
const helpers_1 = require("./helpers");
describe('Validate Suggest Helpers', () => {
    it('test compareResult', () => {
        const sr = [
            { word: 'cone', score: 0.6 },
            { word: 'apple', score: 0.3 },
            { word: 'pear', score: 0.3 },
            { word: 'banana', score: 0.6 },
        ];
        const r = sr.concat([]).sort(helpers.compareResults);
        chai_1.expect(r).to.be.deep.equal([sr[3], sr[0], sr[1], sr[2]]);
    });
    it('test wordToSingleLetterFeatures', () => {
        const tests = [
            { v: '', e: [] },
            { v: 'a', e: [['a', 1]] },
            { v: 'hello', e: [['h', 1], ['e', 1], ['l', 1], ['l', 1], ['o', 1],] },
        ];
        tests.forEach(t => {
            chai_1.expect(helpers.wordToSingleLetterFeatures(t.v)).to.be.deep.equal(t.e);
        });
    });
    it('test mergeFeatures', () => {
        const tests = [
            { v: '', e: [] },
            { v: 'a', e: [['a', 1]] },
            { v: 'hello ole', e: [['h', 1], ['e', 2], ['l', 3], ['o', 2], [' ', 1]] },
        ];
        tests.forEach(t => {
            const map = new helpers_1.FeatureMap();
            helpers.mergeFeatures(map, helpers.wordToSingleLetterFeatures(t.v));
            chai_1.expect([...map]).to.be.deep.equal(t.e);
            chai_1.expect(map.count).to.be.equal(t.e.map(kvp => kvp[1]).reduce((a, b) => a + b, 0));
        });
    });
    it('test wordToTwoLetterFeatures', () => {
        const tests = [
            { v: '', e: [] },
            { v: '^a$', e: [['^a', 1], ['a$', 1],] },
            { v: '^move$', e: [['^m', 1], ['mo', 1], ['ov', 1], ['ve', 1], ['e$', 1],] },
        ];
        tests.forEach(t => {
            chai_1.expect(helpers.wordToTwoLetterFeatures(t.v)).to.be.deep.equal(t.e);
        });
    });
    // cspell:ignore ello
    it('test segmentString', () => {
        const tests = [
            { v: 'a', s: 1, e: 'a'.split('') },
            { v: 'hello', s: 1, e: 'hello'.split('') },
            { v: 'hello', s: 2, e: ['he', 'el', 'll', 'lo'] },
            { v: 'hello', s: 3, e: ['hel', 'ell', 'llo'] },
            { v: 'hello', s: 4, e: ['hell', 'ello'] },
            { v: 'hello', s: 5, e: ['hello'] },
            { v: 'hello', s: 6, e: [] },
            { v: 'hello', s: 7, e: [] },
        ];
        tests.forEach(t => {
            chai_1.expect(helpers.segmentString(t.v, t.s)).to.be.deep.equal(t.e);
        });
    });
    it('test wordToFeatures', () => {
        const comp = (a, b) => a[0].localeCompare(b[0]);
        const features = helpers.wordToFeatures('^hello$');
        chai_1.expect([...features].sort(comp)).to.be.deep.equal([
            ['h', 1],
            ['e', 1],
            ['l', 2],
            ['o', 1],
            ['^', 1],
            ['$', 1],
            ['^h', 1],
            ['he', 1],
            ['el', 1],
            ['ll', 1],
            ['lo', 1],
            ['o$', 1],
        ].sort(comp));
    });
    it('test intersectionScore', () => {
        const fA = helpers.wordToFeatures('^hello$');
        const fB = helpers.wordToFeatures('^goodbye$');
        chai_1.expect(fA.intersectionScore(fA)).to.be.equal(fA.count);
        chai_1.expect(fB.intersectionScore(fB)).to.be.equal(fB.count);
        chai_1.expect(fA.intersectionScore(fB)).to.be.equal(fB.intersectionScore(fA));
        chai_1.expect(fA.intersectionScore(fB)).to.be.equal(4);
    });
    it('test correlationScore', () => {
        const fA = helpers.wordToFeatures('^hello$');
        const fB = helpers.wordToFeatures('^goodbye$');
        chai_1.expect(fA.correlationScore(fA)).to.be.equal(1);
        chai_1.expect(fB.correlationScore(fB)).to.be.equal(1);
        chai_1.expect(fA.correlationScore(fB)).to.be.equal(fB.correlationScore(fA));
        chai_1.expect(fA.correlationScore(fB)).to.be.equal(4 / (fA.count + fB.count - 4));
    });
});
//# sourceMappingURL=helpert.test.js.map