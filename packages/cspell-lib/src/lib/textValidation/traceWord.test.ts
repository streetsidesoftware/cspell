import { describe, expect, test } from 'vitest';

import { pathPackageFixturesURL } from '../../test-util/test.locations.cjs';
import type { TextDocumentRef } from '../Models/TextDocument.js';
import { searchForConfig } from '../Settings/index.js';
import { getDictionaryInternal } from '../SpellingDictionary/index.js';
import { toUri } from '../util/Uri.js';
import { determineTextDocumentSettings } from './determineTextDocumentSettings.js';
import type { WordSplits } from './traceWord.js';
import { traceWord } from './traceWord.js';

const fixturesURL = new URL('traceWords/', pathPackageFixturesURL);
const urlReadme = new URL('README.md', fixturesURL);
const expectedConfigURL = new URL('cspell.config.yaml', fixturesURL);

const ac = <T>(a: Array<T>) => expect.arrayContaining(a);
const oc = <T>(obj: T) => expect.objectContaining(obj);

describe('traceWord', async () => {
    const doc: TextDocumentRef = { uri: toUri(import.meta.url), languageId: 'typescript' };
    const fixtureSettings = (await searchForConfig(urlReadme)) || {};
    const baseSettings = await determineTextDocumentSettings(doc, fixtureSettings);
    const dicts = await getDictionaryInternal(baseSettings);

    test('traceWord', () => {
        const r = traceWord('trace', dicts, baseSettings);
        expect(r.filter((r) => r.found)).toEqual(
            ac([
                {
                    word: 'trace',
                    found: true,
                    foundWord: 'trace',
                    forbidden: false,
                    noSuggest: false,
                    dictName: 'en_us',
                    dictSource: expect.any(String),
                    configSource: undefined,
                    errors: undefined,
                },
            ]),
        );
    });

    test.each`
        word              | expected
        ${'word'}         | ${[wft('word')]}
        ${'word_word'}    | ${[wff('word_word'), wft('word'), wft('word')]}
        ${'word_nword'}   | ${[wff('word_nword'), wft('word'), wff('nword')] /* cspell:ignore nword */}
        ${'ISpellResult'} | ${[wff('ISpellResult'), wft('I'), wft('Spell'), wft('Result')]}
        ${'ERRORcode'}    | ${[wft('ERRORcode'), wft('ERROR'), wft('code')]}
    `('traceWord splits $word', ({ word, expected }) => {
        const r = traceWord(word, dicts, baseSettings);
        expect(r.splits).toEqual(expected);
    });

    test.each`
        word              | expected
        ${'word_word'}    | ${{ ...wft('word'), dictName: 'en_us' }}
        ${'ISpellResult'} | ${{ ...wft('Result'), foundWord: 'result', dictName: 'en_us' }}
        ${'ERRORcode'}    | ${{ ...wft('ERRORcode'), foundWord: 'errorcode', dictName: 'node' }}
        ${'ERRORcode'}    | ${{ ...wft('ERROR'), foundWord: 'error', dictName: 'en_us' }}
        ${'apple-pie'}    | ${{ ...wft('pie'), dictName: 'en_us' }}
        ${"can't"}        | ${{ ...wft("can't"), dictName: 'en_us' }}
        ${'canNOT'}       | ${{ ...wft('canNOT'), foundWord: 'cannot', dictName: 'en_us' }}
        ${'baz'}          | ${{ ...wft('baz'), foundWord: 'baz', dictName: '[words]', dictSource: expectedConfigURL.href }}
    `('traceWord check found $word', ({ word, expected }) => {
        const r = traceWord(word, dicts, baseSettings);
        const matching = r.filter((r) => r.word === expected.word && r.found === expected.found);
        expect(matching).toEqual(ac([oc(expected)]));
    });
});

function wf(word: string, found: boolean): WordSplits {
    return { word, found };
}

function wft(word: string): WordSplits {
    return wf(word, true);
}

function wff(word: string): WordSplits {
    return wf(word, false);
}
