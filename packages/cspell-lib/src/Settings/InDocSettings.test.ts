import * as Text from '../util/text';
import * as TextRange from '../util/TextRange';
import { isDefined } from '../util/util';
import * as InDoc from './InDocSettings';

const oc = expect.objectContaining;
const ac = expect.arrayContaining;
const nac = expect.not.arrayContaining;

// cSpell:ignore faullts straange tooo
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell\x3aenableCompoundWords
    // cSpell\x3adisableCompoundWords
    // cSpell\x3a enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell\x3a ignoreRegExp /\\/\\/\\/.*/
    // cSpell\x3aignoreRegexp w\\w+berry
    // cSpell\x3a:ignoreRegExp  /
    /* cSpell\x3aignoreRegExp \\w+s{4}\\w+ */
    /* cSpell\x3aignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell\x3aignore tripe, comment */
    // cSpell\x3a: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.
    // cSpell\x3alanguage en-US
    // cspell\x3alocal
    // cspell\x3alocale es-ES
    // cspell\x3alocal en, nl

    // cspell\x3adictionaries lorem-ipsum
    // LocalWords: one two three
    // LocalWords:four five six
    // localwords: seven eight nine
`;

// cspell:ignore againxx
const sampleText = `
# cSpell\x3adisableCompoundWords
# cSpell\x3aenableCOMPOUNDWords
# happydays arehere againxx
`;

// cspell:ignore popoutlist
const sampleTextWithIncompleteInDocSetting = `
// spell\x3adictionaries php
// spell\x3awords const
// cspell\x3a
// cspell\x3aignore popoutlist
const x = imp.popoutlist;
// cspell\x3aignore again
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

    const USE_TEST = undefined;

    test.each`
        test                                                               | text                                                               | expected
        ${'Empty Doc'}                                                     | ${''}                                                              | ${{ id: 'in-doc-settings' }}
        ${'cSpell\x3aenableCompoundWords'}                                 | ${'cSpell\x3aenableCompoundWords'}                                 | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3aENABLECompoundWords'}                                 | ${'cSpell\x3aENABLECompoundWords'}                                 | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3adisableCompoundWords'}                                | ${'cSpell\x3adisableCompoundWords'}                                | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3adisableCompoundWORDS'}                                | ${'cSpell\x3adisableCompoundWORDS'}                                | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3aENABLECompoundWords\ncSpell\x3adisableCompoundWords'} | ${'cSpell\x3aENABLECompoundWords\ncSpell\x3adisableCompoundWords'} | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3adisableCompoundWords\ncSpell\x3aenableCompoundWords'} | ${'cSpell\x3adisableCompoundWords\ncSpell\x3aenableCompoundWords'} | ${oc({ allowCompoundWords: true })}
        ${'sampleText'}                                                    | ${sampleText}                                                      | ${oc({ allowCompoundWords: true })}
        ${'sampleCode'}                                                    | ${sampleCode}                                                      | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3aword apple'}                                          | ${USE_TEST}                                                        | ${oc({ words: ['apple'] })}
        ${'/*cSpell\x3aword apple*/'}                                      | ${USE_TEST}                                                        | ${oc({ words: ['apple*/'] })}
        ${'<!--- cSpell\x3aword apple -->'}                                | ${USE_TEST}                                                        | ${oc({ words: ['apple', '-->'] })}
        ${'<!--- cSpell\x3aignoreWords apple -->'}                         | ${USE_TEST}                                                        | ${oc({ ignoreWords: ['apple', '-->'] })}
        ${'<!--- cSpell\x3aforbidWords apple -->'}                         | ${USE_TEST}                                                        | ${oc({ flagWords: ['apple', '-->'] })}
        ${'<!--- cSpell\x3aflag-words apple -->'}                          | ${USE_TEST}                                                        | ${oc({ flagWords: ['apple', '-->'] })}
        ${'# cspell\x3aignore auto* *labeler'}                             | ${USE_TEST}                                                        | ${oc({ ignoreWords: ['auto*', '*labeler'] })}
    `('detect compound words setting: $test', ({ test, text, expected }) => {
        expect(InDoc.getInDocumentSettings(text == USE_TEST ? test : text)).toEqual(expected);
        expect([...InDoc.validateInDocumentSettings(text, {})]).toEqual([]);
    });

    test.each`
        test                                      | text                                    | expected
        ${'Empty Doc'}                            | ${''}                                   | ${{ id: 'in-doc-settings' }}
        ${'sampleTextWithIncompleteInDocSetting'} | ${sampleTextWithIncompleteInDocSetting} | ${oc({ words: ['const'], ignoreWords: ['popoutlist', 'again'], dictionaries: ['php'] })}
        ${'enableCaseSensitive'}                  | ${'// cspell\x3aenableCaseSensitive'}   | ${oc({ caseSensitive: true })}
        ${'disableCaseSensitive'}                 | ${'// cspell\x3adisableCaseSensitive'}  | ${oc({ caseSensitive: false })}
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
        const ranges = TextRange.findMatchingRangesForPatterns(regExpList.filter(isDefined), sampleCode);
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

    // cspell:ignore dictionar lokal

    test.each`
        text                                     | settings | expected
        ${''}                                    | ${{}}    | ${[]}
        ${'cspell\x3a */'}                       | ${{}}    | ${[]}
        ${'cspell\x3a ignore x */'}              | ${{}}    | ${[]}
        ${'cspell\x3a word*/'}                   | ${{}}    | ${[]}
        ${'cspell\x3a word-*/'}                  | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell-checker\x3a word-*/'}           | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spellchecker\x3a word-*/'}            | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell\x3a ignore-next-occurrence */'} | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'ignore-next-occurrence' })]}
        ${'cspell\x3adictionar dutch'}           | ${{}}    | ${[oc({ range: [7, 16], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\x3a:dictionar dutch'}          | ${{}}    | ${[oc({ range: [8, 17], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\x3a ignored */'}               | ${{}}    | ${[oc({ range: [8, 15], suggestions: ac(['ignore', 'ignoreWord']), text: 'ignored' })]}
        ${'cspell\x3alokal en'}                  | ${{}}    | ${[oc({ suggestions: ac(['locale']) })]}
        ${'cspell\x3alokal en'}                  | ${{}}    | ${[oc({ suggestions: nac(['local']) })]}
    `('validateInDocumentSettings', ({ text, settings, expected }) => {
        const result = [...InDoc.validateInDocumentSettings(text, settings)];
        expect(result).toEqual(expected);
    });
});

// cspell:disableCompoundWords
// cspell:ignore localwords happydays arehere
