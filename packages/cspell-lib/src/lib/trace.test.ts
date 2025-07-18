import type { CSpellSettings } from '@cspell/cspell-types';
import type { TestOptions } from 'vitest';
import { describe, expect, test } from 'vitest';

import { getDefaultSettings, mergeSettings } from './Settings/index.js';
import { traceWords } from './trace.js';

const timeout = 20_000;

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);
const ac = (...params: Parameters<typeof expect.arrayContaining>) => expect.arrayContaining(...params);

const testOptions: TestOptions = { timeout };

describe('Verify trace', () => {
    test('tests tracing a word', testOptions, async () => {
        const words = ['apple'];
        const config = await getSettings({ ignoreWords: ['apple'], flagWords: ['apple'] });
        const results = await traceWords(words, config, {});
        expect(results.map(({ dictName, found }) => ({ dictName, found }))).toEqual(
            expect.arrayContaining([
                { dictName: 'en-gb', found: true },
                { dictName: 'en_us', found: true },
                { dictName: 'cpp', found: true },
                { dictName: 'typescript', found: false },
                { dictName: 'companies', found: true },
                { dictName: 'softwareTerms', found: false },
                { dictName: '[ignoreWords]', found: true },
                { dictName: '[words]', found: false },
                { dictName: '[flagWords]', found: true },
            ]),
        );
    });

    // cspell:ignore *error* *code* hte colour colum
    test.each`
        word           | languageId   | locale       | ignoreCase | allowCompoundWords | dictName           | dictActive | found    | forbidden | noSuggest | foundWord
        ${'apple'}     | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'apple'}
        ${'apple'}     | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'en-gb'}         | ${false}   | ${true}  | ${false}  | ${false}  | ${'apple'}
        ${'Apple'}     | ${undefined} | ${undefined} | ${false}   | ${undefined}       | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'Apple'}
        ${'Apple'}     | ${undefined} | ${undefined} | ${false}   | ${undefined}       | ${'companies'}     | ${true}    | ${true}  | ${false}  | ${false}  | ${'Apple'}
        ${'Apple'}     | ${undefined} | ${undefined} | ${false}   | ${undefined}       | ${'cpp'}           | ${false}   | ${true}  | ${false}  | ${false}  | ${'apple'}
        ${'café'}      | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'café'}
        ${'errorcode'} | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${false} | ${false}  | ${false}  | ${undefined}
        ${'errorcode'} | ${undefined} | ${undefined} | ${true}    | ${true}            | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'error+code'}
        ${'errorcode'} | ${'cpp'}     | ${undefined} | ${true}    | ${true}            | ${'cpp'}           | ${true}    | ${true}  | ${false}  | ${false}  | ${'errorcode'}
        ${'errorcode'} | ${'cpp'}     | ${undefined} | ${true}    | ${undefined}       | ${'cpp'}           | ${true}    | ${true}  | ${false}  | ${false}  | ${'errorcode'}
        ${'hte'}       | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${false} | ${false}  | ${false}  | ${undefined}
        ${'hte'}       | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'[flagWords]'}   | ${true}    | ${true}  | ${true}   | ${false}  | ${'hte'}
        ${'Colour'}    | ${undefined} | ${undefined} | ${true}    | ${undefined}       | ${'[ignoreWords]'} | ${true}    | ${true}  | ${false}  | ${true}   | ${'colour'}
        ${'colum'}     | ${undefined} | ${'en'}      | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${false} | ${false}  | ${false}  | ${undefined}
        ${'Colum'}     | ${undefined} | ${'en'}      | ${true}    | ${undefined}       | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'Colum'}
        ${'Colum'}     | ${undefined} | ${'en'}      | ${false}   | ${undefined}       | ${'en_us'}         | ${true}    | ${true}  | ${false}  | ${false}  | ${'Colum'}
    `('trace word "$word" in $dictName', testOptions, async (params) => {
        const { word, languageId, ignoreCase, locale, allowCompoundWords } = params;
        const { dictName, dictActive, found, forbidden, noSuggest, foundWord } = params;
        const words = [word];
        const config = await getSettings({ allowCompoundWords, flagWords: ['hte'], ignoreWords: ['colour'] });
        const results = await traceWords(words, config, { locale, languageId, ignoreCase });

        // console.log(JSON.stringify(byName));

        expect(results.filter((a) => a.dictName === dictName)).toEqual(
            ac([
                oc({
                    dictActive,
                    dictName,
                    forbidden,
                    found,
                    foundWord,
                    noSuggest,
                    word,
                }),
            ]),
        );
    });

    // cspell:ignore ammount
    test.each`
        word         | languageId   | locale  | ignoreCase | preferredSuggestions
        ${'ammount'} | ${undefined} | ${'en'} | ${true}    | ${['amount']}
        ${'colour'}  | ${undefined} | ${'en'} | ${true}    | ${['color']}
        ${'colum'}   | ${undefined} | ${'en'} | ${true}    | ${['column']}
        ${'Colum'}   | ${undefined} | ${'en'} | ${true}    | ${['column']}
    `('trace preferredSuggestions word "$word" in $dictName', testOptions, async (params) => {
        const { word, languageId, ignoreCase, locale, preferredSuggestions } = params;
        const words = [word];
        const config = await getSettings({ suggestWords: ['colour:color'] });
        const results = await traceWords(words, config, { locale, languageId, ignoreCase });

        // console.log(JSON.stringify(byName));

        expect(results.filter((r) => !!r.preferredSuggestions)).toEqual(
            ac([
                oc({
                    found: false,
                    foundWord: undefined,
                    word,
                    preferredSuggestions,
                }),
            ]),
        );
    });

    test('tracing with missing dictionary.', testOptions, async () => {
        const words = ['apple'];
        const defaultConfig = await getSettings();
        const dictionaryDefinitions = [
            ...(defaultConfig.dictionaryDefinitions || []),
            {
                name: 'bad dict',
                path: './missing.txt',
            },
        ];
        const config: CSpellSettings = {
            ...defaultConfig,
            dictionaryDefinitions,
        };
        const results = await traceWords(words, config, {});
        expect(Object.keys(results)).not.toHaveLength(0);
        const foundIn = results.filter((r) => r.found);
        expect(foundIn).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    dictName: 'en_us',
                    dictSource: expect.stringContaining('en_US.trie.gz'),
                }),
            ]),
        );

        const resultsWithErrors = results.filter((r) => !!r.errors);
        expect(resultsWithErrors).toHaveLength(1);

        expect(resultsWithErrors).toContainEqual(
            expect.objectContaining({
                dictName: 'bad dict',
                dictSource: './missing.txt',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining('failed to load'),
                    }),
                ]),
            }),
        );
    });
});

async function getSettings(...settings: CSpellSettings[]): Promise<CSpellSettings> {
    return settings.reduce((a, b) => mergeSettings(a, b), await getDefaultSettings(true));
}
