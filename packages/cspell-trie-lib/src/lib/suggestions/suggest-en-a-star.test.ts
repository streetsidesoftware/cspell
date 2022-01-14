import { readTrie } from '../../test/dictionaries.test.helper';
import { GenSuggestionOptionsStrict } from '../genSuggestionsOptions';
import { genCompoundableSuggestions, suggest } from './suggestAStar';
import {
    suggestionCollector,
    SuggestionCollectorOptions,
    SuggestionResult,
    SuggestionCollector,
} from './suggestCollector';
import { createTimer } from '../utils/timer';
import { CompoundWordsMethod } from '../walker';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

interface ExpectedSuggestion extends Partial<SuggestionResult> {
    word: string;
}

describe('Validate English Suggestions', () => {
    interface WordSuggestionsTest {
        word: string;
        expected: ExpectedSuggestion[];
    }

    // cspell:ignore emplode ballence catagory cateogry
    test.each`
        word          | expected
        ${'hello'}    | ${sr({ word: 'hello', cost: 0 })}
        ${'apple'}    | ${sr({ word: 'apple', cost: 0 }, { word: 'apples', cost: 100 })}
        ${'emplode'}  | ${sr('implode')}
        ${'dont'}     | ${sr("don't")}
        ${'ballence'} | ${sr('balance')}
        ${'catagory'} | ${sr('category')}
        ${'cateogry'} | ${sr({ word: 'category', cost: 75 })}
    `('suggestions for $word', async ({ word, expected }: WordSuggestionsTest) => {
        const trie = await getTrie();
        const x = suggest(trie.root, word, {});
        expect(x).toEqual(expect.arrayContaining(expected.map((e) => expect.objectContaining(e))));
    });

    test(
        'Tests suggestions "joyful"',
        async () => {
            const trie = await getTrie();
            const collector = suggestionCollector('joyful', opts(8, undefined, 1));
            collector.collect(
                genCompoundableSuggestions(trie.root, collector.word, sugGenOptsFromCollector(collector)),
                timeout
            );
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['joyful']));
            expect(suggestions[0]).toBe('joyful');
        },
        timeout
    );

    test(
        'Tests suggestions "joyfull"',
        async () => {
            const trie = await getTrie();
            // cspell:ignore joyfull
            const collector = suggestionCollector('joyfull', opts(8, undefined, 2));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            expect(results).toEqual([
                { cost: 25, word: 'joyful' },
                { cost: 100, word: 'joyfully' },
                { cost: 109, word: 'joy full' },
                { cost: 154, word: 'joyful l' },
                { cost: 155, word: 'joyful L' },
            ]);
        },
        timeout
    );

    test(
        'Tests compound SEPARATE_WORDS suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothreefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3.3));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            expect(results).toEqual([{ cost: 322, word: 'one two three four' }]);
        },
        timeout
    );

    test(
        'Tests compound JOIN_WORDS suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.JOIN_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
        },
        timeout
    );

    test(
        'Tests compound suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.JOIN_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
        },
        timeout
    );

    // Takes a long time.
    test(
        'Tests long compound suggestions `testscomputesuggestions`',
        async () => {
            const trie = await getTrie();
            // cspell:ignore testscomputesuggestions
            const collector = suggestionCollector('testscomputesuggestions', opts(2, undefined, 4, false));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual([
                'tests compute suggestions',
                'tests compute suggestion',
                // 'test compute suggestions',
            ]);
        },
        timeout
    );

    // Takes a long time.
    test(
        'Tests long compound suggestions `testscompundsuggestions`',
        async () => {
            const trie = await getTrie();
            // cspell:ignore testscompundsuggestions
            const collector = suggestionCollector('testscompundsuggestions', opts(1, undefined, 4, false));
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
                ),
                timeout
            );
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(['tests compound suggestions']);
        },
        timeout
    );

    test(
        'Expensive suggestion `testscompundsuggestions`',
        async () => {
            const suggestionTimeout = 100;
            const trie = await getTrie();
            // cspell:ignore testscompundsuggestions
            const collector = suggestionCollector('testscompundsuggestions', opts(1, undefined, 3, false));
            const timer = createTimer();
            collector.collect(
                genCompoundableSuggestions(
                    trie.root,
                    collector.word,
                    sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
                ),
                suggestionTimeout
            );
            const elapsed = timer.elapsed();
            expect(elapsed).toBeLessThan(suggestionTimeout * 4);
        },
        timeout
    );
});

function sugGenOptsFromCollector(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod) {
    const { ignoreCase, changeLimit } = collector;
    const ops: GenSuggestionOptionsStrict = {
        compoundMethod,
        ignoreCase,
        changeLimit,
    };
    return ops;
}

function opts(
    numSuggestions: number,
    filter?: SuggestionCollectorOptions['filter'],
    changeLimit = 3,
    includeTies = true,
    ignoreCase = true
): SuggestionCollectorOptions {
    return {
        numSuggestions,
        filter,
        changeLimit,
        includeTies,
        ignoreCase,
        timeout,
    };
}

function sr(...sugs: (string | ExpectedSuggestion)[]): ExpectedSuggestion[] {
    return sugs.map((s) => {
        if (typeof s === 'string') return { word: s };
        return s;
    });
}
