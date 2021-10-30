import * as Text from '../util/text';
import * as TextRange from '../util/TextRange';
import * as InDoc from './InDocSettings';

const oc = expect.objectContaining;

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
    // cspell:locale es-ES
    // cspell:local en, nl

    // cspell:dictionaries lorem-ipsum
    // LocalWords: one two three
    // LocalWords:four five six
    // localwords: seven eight nine
`;

// cspell:ignore againxx
const sampleText = `
# cSpell:disableCompoundWords
# cSpell:enableCOMPOUNDWords
# happydays arehere againxx
`;

const sampleTextWithIncompleteInDocSetting = `
// spell:dictionaries php
// spell:words const
// cspell:
// cspell:ignore popoutlist
const x = imp.popoutlist;
// cspell:ignore again
`;

// cspell:disable
const sampleTextWithBadRegexp = `
# cspell\x3AignoreRegExp  "(foobar|foo_baz)"');
`;
// cspell:enable

describe('Validate InDocSettings', () => {
    test('tests matching settings', () => {
        const matches = InDoc.internal
            .getPossibleInDocSettings(sampleCode)
            .map((a) => a.slice(1).filter((a) => !!a))
            .toArray();
        expect(matches.map((a) => a[0])).toEqual([
            'enableCompoundWords',
            'disableCompoundWords',
            ' enableCOMPOUNDWords',
            'words whiteberry, redberry, lightbrown',
            ' ignoreRegExp /\\/\\/\\/.*/',
            'ignoreRegexp w\\w+berry',
            'ignoreRegExp  /',
            'ignoreRegExp \\w+s{4}\\w+ */',
            'ignoreRegExp /faullts[/]?/ */',
            'ignore tripe, comment */',
            ' ignoreWords tooo faullts',
            'language en-US',
            'local',
            'locale es-ES',
            'local en, nl',
            'dictionaries lorem-ipsum',
            'LocalWords: one two three',
            'LocalWords:four five six',
        ]);
    });

    test.each`
        test                                                         | text                                                         | expected
        ${'Empty Doc'}                                               | ${''}                                                        | ${{ id: 'in-doc-settings' }}
        ${'cSpell:enableCompoundWords'}                              | ${'cSpell:enableCompoundWords'}                              | ${oc({ allowCompoundWords: true })}
        ${'cSpell:ENABLECompoundWords'}                              | ${'cSpell:ENABLECompoundWords'}                              | ${oc({ allowCompoundWords: true })}
        ${'cSpell:disableCompoundWords'}                             | ${'cSpell:disableCompoundWords'}                             | ${oc({ allowCompoundWords: false })}
        ${'cSpell:disableCompoundWORDS'}                             | ${'cSpell:disableCompoundWORDS'}                             | ${oc({ allowCompoundWords: false })}
        ${'cSpell:ENABLECompoundWords\ncSpell:disableCompoundWords'} | ${'cSpell:ENABLECompoundWords\ncSpell:disableCompoundWords'} | ${oc({ allowCompoundWords: false })}
        ${'cSpell:disableCompoundWords\ncSpell:enableCompoundWords'} | ${'cSpell:disableCompoundWords\ncSpell:enableCompoundWords'} | ${oc({ allowCompoundWords: true })}
        ${'sampleText'}                                              | ${sampleText}                                                | ${oc({ allowCompoundWords: true })}
        ${'sampleCode'}                                              | ${sampleCode}                                                | ${oc({ allowCompoundWords: true })}
    `('detect compound words setting: $test', ({ text, expected }) => {
        expect(InDoc.getInDocumentSettings(text)).toEqual(expected);
    });

    test.each`
        test                                      | text                                    | expected
        ${'Empty Doc'}                            | ${''}                                   | ${{ id: 'in-doc-settings' }}
        ${'sampleTextWithIncompleteInDocSetting'} | ${sampleTextWithIncompleteInDocSetting} | ${oc({ words: ['const'], ignoreWords: ['popoutlist', 'again'], dictionaries: ['php'] })}
    `('extract setting: $test', ({ text, expected }) => {
        expect(InDoc.getInDocumentSettings(text)).toEqual(expected);
    });

    test('tests finding words to add to dictionary', () => {
        const words = InDoc.internal.getWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).toEqual(['whiteberry', 'redberry', 'lightbrown', 'one', 'two', 'three', 'four', 'five', 'six']);
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
        expect(matches).toEqual(['/\\/\\/\\/.*/', 'w\\w+berry', '/', '\\w+s{4}\\w+', '/faullts[/]?/ */']);
        const regExpList = matches.map((s) => Text.stringToRegExp(s));
        expect(regExpList).toEqual([/\/\/\/.*/g, /w\w+berry/gimu, /\//gimu, /\w+s{4}\w+/gimu, /faullts[/]?\/ */g]);
        const ranges = TextRange.findMatchingRangesForPatterns(matches, sampleCode);
        expect(ranges.length).toBe(39);
    });

    test('fetching the local for the text', () => {
        const settings = InDoc.getInDocumentSettings(sampleCode);
        expect(settings.language).toBe('en,nl');
    });

    test('setting dictionaries for file', () => {
        const settings = InDoc.getInDocumentSettings(sampleCode);
        expect(settings.dictionaries).toStrictEqual(['lorem-ipsum']);
    });

    test('bad ignoreRegExp', () => {
        // I currently does not check the validity of the expressions.
        expect(InDoc.getInDocumentSettings(sampleTextWithBadRegexp)).toEqual(
            expect.objectContaining({
                ignoreRegExpList: [`"(foobar|foo_baz)"');`],
            })
        );
    });
});

// cspell:disableCompoundWords
// cspell:ignore localwords happydays arehere
