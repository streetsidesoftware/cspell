"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const chai_1 = require("chai");
const CSpellSettingsServer_1 = require("./CSpellSettingsServer");
const Text = require("./util/text");
const TextRange = require("./util/TextRange");
const InDoc = require("./InDocSettings");
const emptySettings = CSpellSettingsServer_1.mergeInDocSettings({}, {});
describe('Validate InDocSettings', () => {
    it('tests matching settings', () => {
        const matches = InDoc.internal.getPossibleInDocSettings(sampleCode)
            .map(a => a.slice(1).filter(a => !!a))
            .toArray();
        chai_1.expect(matches.map(a => a[0])).to.deep.equal([
            'enableCompoundWords',
            'disableCompoundWords',
            'enableCOMPOUNDWords',
            'words whiteberry, redberry, lightbrown',
            'ignoreRegExp /\\/\\/\\/.*/',
            'ignoreRegexp w\\w+berry',
            'ignoreRegExp  /',
            'ignoreRegExp \\w+s{4}\\w+ */',
            'ignoreRegExp /faullts[/]?/ */',
            'ignore tripe, comment */',
            'ignoreWords tooo faullts',
        ]);
    });
    it('tests extracting in file settings for compound words', () => {
        chai_1.expect(InDoc.getInDocumentSettings('')).to.deep.equal({});
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:enableCompoundWords'), 'cSpell:enableCompoundWords')
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: true }));
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords'), 'cSpell:ENABLECompoundWords')
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: true }));
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords'), 'cSpell:disableCompoundWords')
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: false }));
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWORDS'), 'cSpell:disableCompoundWORDS')
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: false }));
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords\ncSpell:disableCompoundWords'))
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: false }));
        chai_1.expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords\ncSpell:enableCompoundWords'))
            .to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: true }));
        chai_1.expect(InDoc.getInDocumentSettings(sampleText)).to.deep.equal(__assign({}, emptySettings, { allowCompoundWords: true }));
        chai_1.expect(InDoc.getInDocumentSettings(sampleCode).allowCompoundWords).to.be.true;
    });
    it('tests finding words to add to dictionary', () => {
        const words = InDoc.internal.getWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        chai_1.expect(words).to.deep.equal(['whiteberry', 'redberry', 'lightbrown']);
        chai_1.expect(InDoc.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
    });
    it('tests finding words to ignore', () => {
        const words = InDoc.getIgnoreWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        chai_1.expect(words).to.deep.equal(['tripe', 'comment', '*/', 'tooo', 'faullts']);
        chai_1.expect(InDoc.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
    });
    it('tests finding ignoreRegExp', () => {
        const matches = InDoc.getIgnoreRegExpFromDocument(sampleCode);
        chai_1.expect(matches).to.deep.equal([
            '/\\/\\/\\/.*/',
            'w\\w+berry',
            '/',
            '\\w+s{4}\\w+',
            '/faullts[/]?/ */',
        ]);
        const regExpList = matches.map(s => Text.stringToRegExp(s)).map(a => a && a.toString() || '');
        chai_1.expect(regExpList).to.deep.equal([
            (/\/\/\/.*/g).toString(),
            (/w\w+berry/gim).toString(),
            (/\//gim).toString(),
            (/\w+s{4}\w+/gim).toString(),
            (/faullts[/]?\/ */g).toString(),
        ]);
        const ranges = TextRange.findMatchingRangesForPatterns(matches, sampleCode);
        // console.log(ranges);
        // console.log(replaceRangesWith(sampleCode, ranges));
        chai_1.expect(ranges.length).to.be.equal(31);
    });
});
// cSpell:ignore faullts straange
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell:enableCompoundWords
    // cSpell:disableCompoundWords
    // cSpell: enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell: ignoreRegExp /\\/\\/\\/.*/
    // cSpell:ignoreRegexp w\\w+berry
    // cSpell::ignoreRegExp  /
    /* cSpell:ignoreRegExp \\w+s{4}\\w+ */
    /* cSpell:ignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell:ignore tripe, comment */
    // cSpell:: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.

`;
const sampleText = `
# cSpell:disableCompoundWords
# cSpell:enableCOMPOUNDWords
# happydays arehere againxx
`;
function replaceRangesWith(text, ranges, w = '_') {
    let pos = 0;
    let result = '';
    for (const r of ranges) {
        result += text.slice(pos, r.startPos) + w.repeat(r.endPos - r.startPos);
        pos = r.endPos;
    }
    result += text.slice(pos);
    return result;
}
exports.replaceRangesWith = replaceRangesWith;
//# sourceMappingURL=InDocSettings.test.js.map