import type { CSpellSettings, DictionaryDefinitionInline } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import * as Text from '../util/text.js';
import * as TextRange from '../util/TextRange.js';
import { isDefined } from '../util/util.js';
import * as InDoc from './InDocSettings.js';

const dictName = InDoc.__internal.staticInDocumentDictionaryName;

const oc = <T>(obj: T) => expect.objectContaining(obj);
const ac = <T>(a: Array<T>) => expect.arrayContaining(a);
const nac = expect.not.arrayContaining;

// cSpell:ignore faullts straange tooo
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell\u003AenableCompoundWords
    // cSpell\u003AdisableCompoundWords
    // cSpell\u003A enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell\u003A ignoreRegExp /\\/\\/\\/.*/
    // cSpell\u003AignoreRegexp w\\w+berry
    // cSpell\u003A:ignoreRegExp  /
    /* cSpell\u003AignoreRegExp \\w+s{4}\\w+ */
    /* cSpell\u003AignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell\u003Aignore tripe, comment */
    // cSpell\u003A: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.
    // cSpell\u003Alanguage en-US
    // cspell\u003Alocal
    // cspell\u003Alocale es-ES
    // cspell\u003Alocal en, nl

    // cspell\u003Adictionaries lorem-ipsum
    // LocalWords: one two three
    // LocalWords:four five six
    // localwords: seven eight nine
`;

// cspell:ignore againxx
const sampleText = `
# cSpell\u003AdisableCompoundWords
# cSpell\u003AenableCOMPOUNDWords
# happydays arehere againxx
`;

// cspell:ignore popoutlist
const sampleTextWithIncompleteInDocSetting = `
// spell\u003Adictionaries php
// spell\u003Awords const
// cspell\u003A
// cspell\u003Aignore popoutlist
const x = imp.popoutlist;
// cspell\u003Aignore again
`;

const sampleInDocDict: DictionaryDefinitionInline = {
    name: dictName,
    words: ['const'],
    ignoreWords: ['popoutlist', 'again'],
};

// cspell:disable
const sampleTextWithBadRegexp = `
# cspell\u003AignoreRegExp  "(foobar|foo_baz)"');
`;
// cspell:enable

describe('Validate InDocSettings', () => {
    test('tests matching settings', () => {
        const matches = [...InDoc.__internal.getPossibleInDocSettings(sampleCode)].map((a) => a.match);
        expect(matches).toEqual([
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
            'locale es-ES',
            'local en, nl',
            'dictionaries lorem-ipsum',
            'LocalWords: one two three',
            'LocalWords:four five six',
        ]);
    });

    const USE_TEST = undefined;

    test.each`
        test                                                                   | text                                                                   | expected
        ${'Empty Doc'}                                                         | ${''}                                                                  | ${{ id: 'in-doc-settings' }}
        ${'cSpell\u003AenableCompoundWords'}                                   | ${'cSpell\u003AenableCompoundWords'}                                   | ${oc({ allowCompoundWords: true })}
        ${'cSpell\u003AENABLECompoundWords'}                                   | ${'cSpell\u003AENABLECompoundWords'}                                   | ${oc({ allowCompoundWords: true })}
        ${'cSpell\u003AdisableCompoundWords'}                                  | ${'cSpell\u003AdisableCompoundWords'}                                  | ${oc({ allowCompoundWords: false })}
        ${'cSpell\u003AdisableCompoundWORDS'}                                  | ${'cSpell\u003AdisableCompoundWORDS'}                                  | ${oc({ allowCompoundWords: false })}
        ${'cSpell\u003AENABLECompoundWords\ncSpell\u003AdisableCompoundWords'} | ${'cSpell\u003AENABLECompoundWords\ncSpell\u003AdisableCompoundWords'} | ${oc({ allowCompoundWords: false })}
        ${'cSpell\u003AdisableCompoundWords\ncSpell\u003AenableCompoundWords'} | ${'cSpell\u003AdisableCompoundWords\ncSpell\u003AenableCompoundWords'} | ${oc({ allowCompoundWords: true })}
        ${'sampleText'}                                                        | ${sampleText}                                                          | ${oc({ allowCompoundWords: true })}
        ${'sampleCode'}                                                        | ${sampleCode}                                                          | ${oc({ allowCompoundWords: true })}
        ${'cSpell\u003Aword apple'}                                            | ${USE_TEST}                                                            | ${oc(inDocDict({ words: ['apple'] }))}
        ${'/*cSpell\u003Aword apple*/'}                                        | ${USE_TEST}                                                            | ${oc(inDocDict({ words: ['apple*/'] }))}
        ${'<!--- cSpell\u003Aword apple -->'}                                  | ${USE_TEST}                                                            | ${oc(inDocDict({ words: ['apple', '-->'] }))}
        ${'<!--- cSpell\u003AignoreWords apple -->'}                           | ${USE_TEST}                                                            | ${oc(inDocDict({ ignoreWords: ['apple', '-->'] }))}
        ${'<!--- cSpell\u003AforbidWords apple -->'}                           | ${USE_TEST}                                                            | ${oc(inDocDict({ flagWords: ['apple', '-->'] }))}
        ${'<!--- cSpell\u003Aflag-words apple -->'}                            | ${USE_TEST}                                                            | ${oc(inDocDict({ flagWords: ['apple', '-->'] }))}
        ${'# cspell\u003Aignore auto* *labeler'}                               | ${USE_TEST}                                                            | ${oc(inDocDict({ ignoreWords: ['auto*', '*labeler'] }))}
    `('detect compound words setting: $test', ({ test, text, expected }) => {
        expect(InDoc.getInDocumentSettings(text == USE_TEST ? test : text)).toEqual(expected);
        expect([...InDoc.validateInDocumentSettings(text, {})]).toEqual([]);
    });

    test.each`
        test                                      | text                                     | expected
        ${'Empty Doc'}                            | ${''}                                    | ${{ id: 'in-doc-settings' }}
        ${'sampleTextWithIncompleteInDocSetting'} | ${sampleTextWithIncompleteInDocSetting}  | ${oc(inDocDict(sampleInDocDict, ['php']))}
        ${'enableCaseSensitive'}                  | ${'// cspell\u003AenableCaseSensitive'}  | ${oc({ caseSensitive: true })}
        ${'disableCaseSensitive'}                 | ${'// cspell\u003AdisableCaseSensitive'} | ${oc({ caseSensitive: false })}
    `('extract setting: $test', ({ text, expected }) => {
        expect(InDoc.getInDocumentSettings(text)).toEqual(expected);
    });

    test('tests finding words to add to dictionary', () => {
        const words = InDoc.__internal.getWordsFromDocument(sampleCode);
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
        text                                       | settings | expected
        ${''}                                      | ${{}}    | ${[]}
        ${'cspell\u003A */'}                       | ${{}}    | ${[]}
        ${'cspell\u003A ignore x */'}              | ${{}}    | ${[]}
        ${'cspell\u003A word*/'}                   | ${{}}    | ${[]}
        ${'cspell\u003A word-*/'}                  | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell-checker\u003A word-*/'}           | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spellchecker\u003A word-*/'}            | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'word-' })]}
        ${'spell\u003A ignore-next-occurrence */'} | ${{}}    | ${[oc({ message: 'Unknown CSpell directive', text: 'ignore-next-occurrence' })]}
        ${'cspell\u003Adictionar dutch'}           | ${{}}    | ${[oc({ range: [7, 16], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\u003A:dictionar dutch'}          | ${{}}    | ${[oc({ range: [8, 17], suggestions: ac(['dictionary', 'dictionaries']), text: 'dictionar' })]}
        ${'cspell\u003A ignored */'}               | ${{}}    | ${[oc({ range: [8, 15], suggestions: ac(['ignore', 'ignoreWord']), text: 'ignored' })]}
        ${'cspell\u003Alokal en'}                  | ${{}}    | ${[oc({ suggestions: ac(['locale']) })]}
        ${'cspell\u003Alokal en'}                  | ${{}}    | ${[oc({ suggestions: nac(['local']) })]}
    `('validateInDocumentSettings $text', ({ text, settings, expected }) => {
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
