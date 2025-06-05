import { CSpellSettings } from '@cspell/cspell-types';
import { ICSpellConfigFile } from 'cspell-config-lib';
import { describe, expect, test } from 'vitest';

import type { SuggestedWord, SuggestionOptions } from './suggestions.js';
import { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions.js';
import { asyncIterableToArray } from './util/util.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);
const ac = (...params: Parameters<typeof expect.arrayContaining>) => expect.arrayContaining(...params);

const timeout = 20_000;

describe('suggestions', () => {
    const cfgFile = toConfigFile({ language: 'en-gb' });

    test.each`
        word       | options                                 | settings                       | expected
        ${'apple'} | ${undefined}                            | ${undefined}                   | ${ac([sug('apple', 0, ['en_us']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${opt({ strict: false })}               | ${undefined}                   | ${ac([sug('apple', 0, ['en_us', 'companies']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${opt({ includeDefaultConfig: false })} | ${undefined}                   | ${[]}
        ${'apple'} | ${{}}                                   | ${{}}                          | ${ac([sug('apple', 0, ['en_us']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${{}}                                   | ${{ language: 'en-gb' }}       | ${ac([sug('apple', 0, ['en-gb']), sug('Apple', 1, ['companies', 'en-gb'])])}
        ${'apple'} | ${{}}                                   | ${cfgFile}                     | ${ac([sug('apple', 0, ['en-gb']), sug('Apple', 1, ['companies', 'en-gb'])])}
        ${'apple'} | ${{ locale: 'en-gb' }}                  | ${undefined}                   | ${ac([sug('apple', 0, ['en-gb']), sug('Apple', 1, ['companies', 'en-gb'])])}
        ${'apple'} | ${{ dictionaries: ['en-gb'] }}          | ${undefined}                   | ${ac([sug('apple', 0, ['en-gb'])])}
        ${'apple'} | ${undefined}                            | ${{ dictionaries: ['en-gb'] }} | ${ac([sug('apple', 0, ['en-gb', 'en_us']), sug('Apple', 1, ['en-gb', 'en_us', 'companies'])])}
    `(
        'suggestionsForWord default settings word: "$word", opts: $options, settings: $settings',
        { timeout },
        async ({ word, options, settings, expected }) => {
            const results = await suggestionsForWord(word, options, settings);
            expect(results.word).toEqual(word);
            expect(results.suggestions).toEqual(expected);

            const resultsAsync = await asyncIterableToArray(suggestionsForWords([word], options, settings));
            expect(resultsAsync).toHaveLength(1);
            expect(resultsAsync[0].word).toEqual(word);
            expect(resultsAsync[0].suggestions).toEqual(expected);
        },
    );

    test.each`
        word       | options                               | settings
        ${'apple'} | ${opt({ dictionaries: ['unknown'] })} | ${undefined}
    `(
        'suggestionsForWord ERRORS word: "$word", opts: $options, settings: $settings',
        { timeout },
        async ({ word, options, settings }) => {
            await expect(suggestionsForWord(word, options, settings)).rejects.toThrow(SuggestionError);
        },
    );
});

describe('Suggestions English', async () => {
    // const configLoader = getDefaultConfigLoaderInternal();
    // const settings = await configLoader.getGlobalSettingsAsync();

    // cspell:ignore orangges
    test('Orangges', async () => {
        const results = await suggestionsForWord('orangges', { languageId: 'typescript', locale: 'en-US' }, {});
        expect(results.suggestions).toEqual([
            sug('oranges', 100),
            sug('Orange', 181),
            sug('ranges', 185),
            sug('orangs', 190),
            sug('orange', 200),
            sug('orangey', 200),
            sug('orangier', 200),
            sug('orangiest'),
        ]);
    });

    test('Orangges 2', async () => {
        const results = await suggestionsForWord(
            'orangges',
            { languageId: 'typescript' },
            toConfigFile({ language: 'en-us' }),
        );
        expect(results.suggestions).toEqual([
            sug('oranges', 100),
            sug('Orange', 181),
            sug('ranges', 185),
            sug('orangs', 190),
            sug('orange', 200),
            sug('orangey', 200),
            sug('orangier', 200),
            sug('orangiest'),
        ]);
    });
});

function toConfigFile(settings: CSpellSettings): ICSpellConfigFile {
    return {
        url: new URL('cspell.json', import.meta.url),
        settings,
    };
}

function opt(opt: Partial<SuggestionOptions>): SuggestionOptions {
    return opt;
}

function sug(word: string, cost?: number, dicts?: string[]) {
    const suggestedWord: Partial<SuggestedWord> = { word };
    if (cost !== undefined) suggestedWord.cost = cost;
    if (dicts) {
        suggestedWord.dictionaries = [...dicts].sort();
    }
    return oc(suggestedWord);
}
