import { describe, expect, test } from 'vitest';

import type { SuggestionOptions } from './suggestions.js';
import { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions.js';
import { asyncIterableToArray } from './util/util.js';

const oc = <T>(obj: T) => expect.objectContaining(obj);
const ac = <T>(a: Array<T>) => expect.arrayContaining(a);

const timeout = 20_000;

describe('suggestions', () => {
    test.each`
        word       | options                                 | settings                       | expected
        ${'apple'} | ${undefined}                            | ${undefined}                   | ${ac([sug('apple', 0, ['en_us']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${opt({ strict: false })}               | ${undefined}                   | ${ac([sug('apple', 0, ['en_us', 'companies']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${opt({ includeDefaultConfig: false })} | ${undefined}                   | ${[]}
        ${'apple'} | ${{}}                                   | ${{}}                          | ${ac([sug('apple', 0, ['en_us']), sug('Apple', 1, ['en_us', 'companies'])])}
        ${'apple'} | ${{}}                                   | ${{ language: 'en-gb' }}       | ${ac([sug('apple', 0, ['en-gb']), sug('Apple', 1, ['companies'])])}
        ${'apple'} | ${{ locale: 'en-gb' }}                  | ${undefined}                   | ${ac([sug('apple', 0, ['en-gb']), sug('Apple', 1, ['companies'])])}
        ${'apple'} | ${{ dictionaries: ['en-gb'] }}          | ${undefined}                   | ${ac([sug('apple', 0, ['en-gb'])])}
        ${'apple'} | ${undefined}                            | ${{ dictionaries: ['en-gb'] }} | ${ac([sug('apple', 0, ['en_us', 'en-gb']), sug('Apple', 1, ['en_us', 'companies'])])}
    `(
        'suggestionsForWord default settings word: "$word", opts: $options, settings: $settings',
        async ({ word, options, settings, expected }) => {
            const results = await suggestionsForWord(word, options, settings);
            expect(results.word).toEqual(word);
            expect(results.suggestions).toEqual(expected);

            const resultsAsync = await asyncIterableToArray(suggestionsForWords([word], options, settings));
            expect(resultsAsync).toHaveLength(1);
            expect(resultsAsync[0].word).toEqual(word);
            expect(resultsAsync[0].suggestions).toEqual(expected);
        },
        { timeout },
    );

    test.each`
        word       | options                               | settings
        ${'apple'} | ${opt({ dictionaries: ['unknown'] })} | ${undefined}
    `(
        'suggestionsForWord ERRORS word: "$word", opts: $options, settings: $settings',
        async ({ word, options, settings }) => {
            await expect(suggestionsForWord(word, options, settings)).rejects.toThrow(SuggestionError);
        },
        { timeout },
    );

    function opt(opt: Partial<SuggestionOptions>): SuggestionOptions {
        return opt;
    }

    function sug(word: string, cost: number, dicts: string[]) {
        const dictionaries = [...dicts].sort();
        return oc({ word, cost, dictionaries });
    }
});
