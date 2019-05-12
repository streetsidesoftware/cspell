"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Validator = require("./validator");
const loremIpsum = require('lorem-ipsum');
const tds = require("./Settings/TextDocumentSettings");
const DefaultSettings_1 = require("./Settings/DefaultSettings");
const validator_1 = require("./validator");
// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked
const defaultSettings = Object.assign({}, DefaultSettings_1.getDefaultSettings(), { enabledLanguageIds: ['plaintext', 'javascript'] });
function getSettings(text, languageId) {
    return tds.combineTextAndLanguageSettings(defaultSettings, text, languageId);
}
describe('Validator', function () {
    this.timeout(5000);
    it('validates the validator', () => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({ text }) => text);
            chai_1.expect(words).to.be.deep.equal(['brouwn', 'jumpped', 'lazzy']);
        });
    });
    it('validates ignore Case', () => {
        const text = 'The Quick brown fox Jumped over the lazy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({ text }) => text);
            chai_1.expect(words).to.be.deep.equal([]);
        });
    });
    it('validate limit', () => {
        const text = loremIpsum({ count: 5, unit: 'paragraphs' });
        const languageId = 'plaintext';
        const settings = Object.assign({}, getSettings(text, languageId), { maxNumberOfProblems: 10 });
        const results = Validator.validateText(text, settings);
        return results.then(results => chai_1.expect(results).to.be.lengthOf(10));
    });
    it('validates reserved words', () => {
        const text = 'constructor const prototype type typeof null undefined';
        const languageId = 'javascript';
        const settings = Object.assign({}, getSettings(text, languageId), { maxNumberOfProblems: 10 });
        const results = Validator.validateText(text, settings);
        return results.then(results => chai_1.expect(results).to.be.lengthOf(0));
    });
    it('validates regex inclusions/exclusions', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = Object.assign({}, getSettings(text, languageId), { maxNumberOfProblems: 10 });
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            chai_1.expect(words).to.contain('wrongg');
            chai_1.expect(words).to.contain('mispelled');
            chai_1.expect(words).to.not.contain('xaccd');
            chai_1.expect(words).to.not.contain('ctrip');
            chai_1.expect(words).to.not.contain('FFEE');
            chai_1.expect(words).to.not.contain('nmove');
        });
    });
    it('validates ignoreRegExpList', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = Object.assign({}, getSettings(text, languageId), { maxNumberOfProblems: 10, ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] });
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            chai_1.expect(words).to.not.contain('wrongg');
            chai_1.expect(words).to.not.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
    it('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(sampleCode, { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] });
        return results.then(results => {
            const words = results.map(wo => wo.text);
            chai_1.expect(words).to.not.contain('wrongg');
            chai_1.expect(words).to.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
    it('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.text);
            chai_1.expect(words).to.contain('wrongg');
            chai_1.expect(words).to.not.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
    // cspell:ignore hellosd applesq bananasa respectss
    it('Issue #7', () => {
        const text = `Fails to detect obviously misspelt words, such as:
            hellosd
            applesq
            bananasa
            respectss
        `;
        const expected = [
            'hellosd',
            'applesq',
            'bananasa',
            'respectss',
        ];
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({ text }) => text);
            chai_1.expect(words.sort()).to.be.deep.equal(expected.sort());
        });
    });
    it('Validates contractions', () => {
        const text = `
            We have a bit of text to check. Don't look too hard.
            Which single quote to use? Is it shouldn't or shouldn’t?
        `;
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({ text }) => text);
            chai_1.expect(words.sort()).to.be.deep.equal([]);
        });
    });
    it('tests calcIncludeExcludeInfo', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words, ignoreRegExpList: [/The/g] });
        const strings = info.items.map(a => a.text);
        chai_1.expect(strings).to.be.length(17);
        chai_1.expect(strings.join('')).to.be.equal(sampleText);
        let last = 0;
        info.items.forEach(i => {
            chai_1.expect(i.startPos).to.be.equal(last);
            last = i.endPos;
        });
        chai_1.expect(last).to.be.equal(sampleText.length);
    });
    it('tests calcIncludeExcludeInfo exclude everything', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words, ignoreRegExpList: [/(.|\s)+/] });
        const result = info.items.map(a => a.text);
        chai_1.expect(result).to.be.length(1);
        chai_1.expect(result.join('')).to.be.equal(sampleText);
        chai_1.expect(info.items[0].flagIE).to.be.equal(validator_1.IncludeExcludeFlag.EXCLUDE);
    });
    it('tests calcIncludeExcludeInfo include everything', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words });
        const result = info.items.map(a => a.text);
        chai_1.expect(result).to.be.length(9);
        chai_1.expect(result.join('')).to.be.equal(sampleText);
        chai_1.expect(info.items[0].flagIE).to.be.equal(validator_1.IncludeExcludeFlag.INCLUDE);
    });
});
const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

`;
// cspell:ignore lightbrown whiteberry redberry
const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
const sampleWords = [
    'and',
    'ant',
    'apple',
    'ate',
    'big',
    'elephant',
    'giraffe',
    'grape',
    'little',
    'mango',
    'orange',
    'purple',
    'the',
    'tiger',
    'worm',
];
//# sourceMappingURL=validator.test.js.map