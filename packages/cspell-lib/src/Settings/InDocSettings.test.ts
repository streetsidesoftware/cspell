import * as Text from '../util/text';
import * as TextRange from '../util/TextRange';
import * as InDoc from './InDocSettings';

describe('Validate InDocSettings', () => {
    test('tests matching settings', () => {
        const matches = InDoc.internal.getPossibleInDocSettings(sampleCode)
            .map(a => a.slice(1).filter(a => !!a))
            .toArray();
        expect(matches.map(a => a[0])).toEqual([
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
            'language en-US',
            'local',
            'local en, nl',
        ]);
    });

    test('tests extracting in file settings for compound words', () => {
        expect(InDoc.getInDocumentSettings('')).toEqual({ id: 'in-doc-settings' });
        // 'cSpell:enableCompoundWords'
        expect(
            InDoc.getInDocumentSettings('cSpell:enableCompoundWords').allowCompoundWords
        ).toBe(true);
        // 'cSpell:ENABLECompoundWords'
        expect(
            InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords').allowCompoundWords
        ).toBe(true);
        // 'cSpell:disableCompoundWords'
        expect(
            InDoc.getInDocumentSettings('cSpell:disableCompoundWords').allowCompoundWords
        ).toBe(false);
        // 'cSpell:disableCompoundWORDS'
        expect(
            InDoc.getInDocumentSettings('cSpell:disableCompoundWORDS').allowCompoundWords
        ).toBe(false);
        expect(InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords\ncSpell:disableCompoundWords').allowCompoundWords).toBe(false);
        expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords\ncSpell:enableCompoundWords').allowCompoundWords).toBe(true);
        expect(InDoc.getInDocumentSettings(sampleText).allowCompoundWords).toBe(true);
        expect(InDoc.getInDocumentSettings(sampleCode).allowCompoundWords).toBe(true);
    });

    test('tests finding words to add to dictionary', () => {
        const words = InDoc.internal.getWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).toEqual(['whiteberry', 'redberry', 'lightbrown']);
        expect(InDoc.getIgnoreWordsFromDocument('Hello')).toEqual([]);
    });

    test('tests finding words to ignore', () => {
        const words = InDoc.getIgnoreWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).toEqual(['tripe', 'comment', '*/', 'tooo', 'faullts']);
        expect(InDoc.getIgnoreWordsFromDocument('Hello')).toEqual([]);
    });

    test('tests finding ignoreRegExp', () => {
        const matches = InDoc.getIgnoreRegExpFromDocument(sampleCode);
        expect(matches).toEqual([
            '/\\/\\/\\/.*/',
            'w\\w+berry',
            '/',
            '\\w+s{4}\\w+',
            '/faullts[/]?/ */',
         ]);
        const regExpList = matches.map(s => Text.stringToRegExp(s)).map(a => a && a.toString() || '');
        expect(regExpList).toEqual([
            (/\/\/\/.*/g).toString(),
            (/w\w+berry/gim).toString(),
            (/\//gim).toString(),
            (/\w+s{4}\w+/gim).toString(),
            (/faullts[/]?\/ */g).toString(),
        ]);
        const ranges = TextRange.findMatchingRangesForPatterns(matches, sampleCode);
        // console.log(ranges);
        // console.log(replaceRangesWith(sampleCode, ranges));
        expect(ranges.length).toBe(34);
    });

    test('test fetching the local for the text', () => {
        const settings = InDoc.getInDocumentSettings(sampleCode);
        expect(settings.language).toBe('en, nl');
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
    // cSpell:language en-US
    // cspell:local
    // cspell:local en, nl

`;

// cspell:ignore againxx
const sampleText = `
# cSpell:disableCompoundWords
# cSpell:enableCOMPOUNDWords
# happydays arehere againxx
`;

