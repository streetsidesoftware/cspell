import chalk from 'chalk';
import type { SuggestedWord } from 'cspell-lib';
import { describe, expect, test, vi } from 'vitest';

import type { EmitSuggestionOptions } from './suggestionsEmitter.js';
import { emitSuggestionResult } from './suggestionsEmitter.js';

chalk.level = 0;

describe('suggestionsEmitter', () => {
    test.each`
        word      | sug1             | sug2                                                     | options
        ${'walk'} | ${sw('walk', 0)} | ${sw('walked', 2)}                                       | ${opts({})}
        ${'walk'} | ${sw('walk', 0)} | ${sw('walked', 2)}                                       | ${opts({ verbose: 1 })}
        ${'walk'} | ${sw('walk', 0)} | ${sw('walked', 2, { noSuggest: true })}                  | ${opts({ verbose: 1 })}
        ${'walk'} | ${sw('walk', 0)} | ${sw('walked', 2, { forbidden: true })}                  | ${opts({ verbose: 1 })}
        ${'walk'} | ${sw('walk', 0)} | ${sw('walked', 2, { forbidden: true, noSuggest: true })} | ${opts({ verbose: 1 })}
    `('emitSuggestionResult $word $sug1 $sug2 $options', ({ word, sug1, sug2, options }) => {
        const log = vi.fn();
        const sr = {
            word,
            suggestions: [sug1, sug2].filter((a) => !!a),
        };

        emitSuggestionResult(sr, opts(options, { output: { log } }));

        expect(log.mock.calls.join('\n')).toMatchSnapshot();
    });
});

function opts(a: Partial<EmitSuggestionOptions>, b: Partial<EmitSuggestionOptions> = {}): EmitSuggestionOptions {
    return { ...a, ...b };
}

function sw(word: string, cost: number, s: Partial<SuggestedWord> = {}): SuggestedWord {
    const { dictionaries = ['dict-a'], noSuggest = false, forbidden = false, compoundWord = undefined } = s;
    return { word, cost, dictionaries, noSuggest, forbidden, compoundWord };
}
