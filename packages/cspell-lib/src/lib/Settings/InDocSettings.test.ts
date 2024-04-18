import type { CSpellSettings, DictionaryDefinitionInline } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import * as Text from '../util/text.js';
import * as TextRange from '../util/TextRange.js';
import { isDefined } from '../util/util.js';
import * as InDoc from './InDocSettings.js';

const dictName = InDoc.internal.staticInDocumentDictionaryName;

const oc = expect.objectContaining;
const ac = expect.arrayContaining;
const nac = expect.not.arrayContaining;

// cSpell:ignore faullts straange tooo
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell\x3AenableCompoundWords
    // cSpell\x3AdisableCompoundWords
    // cSpell\x3A enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell\x3A ignoreRegExp /\\/\\/\\/.*/
    // cSpell\x3AignoreRegexp w\\w+berry
    // cSpell\x3A:ignoreRegExp  /
    /* cSpell\x3AignoreRegExp \\w+s{4}\\w+ */
    /* cSpell\x3AignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell\x3Aignore tripe, comment */
    // cSpell\x3A: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.
    // cSpell\x3Alanguage en-US
    // cspell\x3Alocal
    // cspell\x3Alocale es-ES
    // cspell\x3Alocal en, nl

    // cspell\x3Adictionaries lorem-ipsum
    // LocalWords: one two three
    // LocalWords:four five six
    // localwords: seven eight nine
`;

// cspell:ignore againxx
const sampleText = `
# cSpell\x3AdisableCompoundWords
# cSpell\x3AenableCOMPOUNDWords
# happydays arehere againxx
`;

// cspell:ignore popoutlist
const sampleTextWithIncompleteInDocSetting = `
// spell\x3Adictionaries php
// spell\x3Awords const
// cspell\x3A
// cspell\x3Aignore popoutlist
const x = imp.popoutlist;
// cspell\x3Aignore again
`;

const sampleInDocDict: DictionaryDefinitionInline = {
    name: dictName,
    words: ['const'],
    ignoreWords: ['popoutlist', 'again'],
};

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
        ${'cSpell\x3AenableCompoundWords'}                                 | ${'cSpell\x3AenableCompoundWords'}                                 | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3AENABLECompoundWords'}                                 | ${'cSpell\x3AENABLECompoundWords'}                                 | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3AdisableCompoundWords'}                                | ${'cSpell\x3AdisableCompoundWords'}                                | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3AdisableCompoundWORDS'}                                | ${'cSpell\x3AdisableCompoundWORDS'}                                | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3AENABLECompoundWords\ncSpell\x3AdisableCompoundWords'} | ${'cSpell\x3AENABLECompoundWords\ncSpell\x3AdisableCompoundWords'} | ${oc({ allowCompoundWords: false })}
        ${'cSpell\x3AdisableCompoundWords\ncSpell\x3AenableCompoundWords'} | ${'cSpell\x3AdisableCompoundWords\ncSpell\x3AenableCompoundWords'} | ${oc({ allowCompoundWords: true })}
        ${'sampleText'}                                                    | ${sampleText}                                                      | ${oc({ allowCompoundWords: true })}
        ${'sampleCode'}                                                    | ${sampleCode}                                                      | ${oc({ allowCompoundWords: true })}
        ${'cSpell\x3Aword apple'}                                          | ${USE_TEST}                                                        | ${oc(inDocDict({ words: ['apple'] }))}
        ${'/*cSpell\x3Aword apple*/'}                                      | ${USE_TEST}                                                        | ${oc(inDocDict({ words: ['apple*/'] }))}
        ${'<!--- cSpell\x3Aword apple -->'}                                | ${USE_TEST}                                                        | ${oc(inDocDict({ words: ['apple', '-->'] }))}
        ${'<!--- cSpell\x3AignoreWords apple -->'}                         | ${USE_TEST}                                                        | ${oc(inDocDict({ ignoreWords: ['apple', '-->'] }))}
        ${'<!--- cSpell\x3AforbidWords apple -->'}                         | ${USE_TEST}                                                        | ${oc(inDocDict({ flagWords: ['apple', '-->'] }))}
        ${'<!--- cSpell\x3Aflag-words apple -->'}                          | ${USE_TEST}                                                        | ${oc(inDocDict({ flagWords: ['apple', '-->'] }))}
        ${'# cspell\x3Aignore auto* *labeler'}                             | ${USE_TEST}                                                        | ${oc(inDocDict({ ignoreWords: ['auto*', '*labeler'] }))}
    `('detect compound words setting: $test', ({ test, text, expected }) => {
        expect(InDoc.getInDocumentSettings(text == USE_TEST ? test : text)).toEqual(expected);
        expect([...InDoc.validateInDocumentSettings(text, {})]).toEqual([]);
    });

    test.each`
        test                                      | text                                    | expected
        ${'Empty Doc'}                            | ${''}                                   | ${{ id: 'in-doc-settings' }}
        ${'sampleTextWithIncompleteInDocSetting'} | ${sampleTextWithIncompleteInDocSetting} | ${oc(inDocDict(sampleInDocDict, ['php']))}
        ${'enableCaseSensitive'}                  | ${'// cspell\x3AenableCaseSensitive'}   | ${oc({ caseSensitive: true })}
        ${'disableCaseSensitive'}                 | ${'// cspell\x3AdisableCaseSensitive'}  | ${oc({ caseSensitive: false })}
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
        expect(settings.dictionaries).toStrictEqual(['lorem-ipsum', '[in-document-dict]']);
    });

    test('bad ignoreRegExp', () => {
        // I currently does not check the validity of the expressions.
        expect(InDoc.getInDocumentSettings(sampleTextWithBadRegexp)).toEqual(
            expect.objectContaining({
                ignoreRegExpList: [`"(foobar|foo_baz)"');`],
            }),
        );
    });

    // cspell:ignore dictionar lokal

    test.each`
        text                                     | settings | expected
        ${''}                                    | ${{}}    | ${[]}
        ${'cspell\x3A */'}                       | ${{}}    | ${[]}
        ${'cspell\x3A ignore x */'}              | ${{}}    | ${[]}
        ${'cspell\x3A word*/'}                   | ${{}}    | ${[]}
        ${'cspell\x3A word-*/'}                  | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell-checker\x3A word-*/'}           | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spellchecker\x3A word-*/'}            | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell\x3A ignore-next-occurrence */'} | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'ignore-next-occurrence' })]}
        ${'cspell\x3Adictionar dutch'}           | ${{}}    | ${[oc({ range: [7, 16], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\x3A:dictionar dutch'}          | ${{}}    | ${[oc({ range: [8, 17], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\x3A ignored */'}               | ${{}}    | ${[oc({ range: [8, 15], suggestions: ac(['ignore', 'ignoreWord']), text: 'ignored' })]}
        ${'cspell\x3Alokal en'}                  | ${{}}    | ${[oc({ suggestions: ac(['locale']) })]}
        ${'cspell\x3Alokal en'}                  | ${{}}    | ${[oc({ suggestions: nac(['local']) })]}
    `('validateInDocumentSettings', ({ text, settings, expected }) => {
        const result = [...InDoc.validateInDocumentSettings(text, settings)];
        expect(result).toEqual(expected);
    });
});

function inDocDict(dict: Partial<DictionaryDefinitionInline>, dictionaries: string[] = []): CSpellSettings {
    const def = {
        name: dictName,
        ...dict,
    } as DictionaryDefinitionInline;

    dictionaries = [...dictionaries, dictName];
    return {
        dictionaryDefinitions: [def],
        dictionaries,
    };
}

// cspell:disableCompoundWords
// cspell:ignore localwords happydays arehere
