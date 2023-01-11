import assert from 'assert';

import { readRawDictionaryFile, readTrie } from '../../test/dictionaries.test.helper';
import type { WeightMap } from '..';
import { mapDictionaryInformationToWeightMap } from '..';
import type { DictionaryInformation } from '../models/DictionaryInformation';
import { clean } from '../trie-util';
import { createTimer } from '../utils/timer';
import type { SuggestionOptions } from './genSuggestionsOptions';
import { genCompoundableSuggestions, suggest } from './suggest';
import type { SuggestionCollectorOptions, SuggestionResult } from './suggestCollector';
import { suggestionCollector } from './suggestCollector';
import { CompoundWordsMethod } from './walker';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

interface ExpectedSuggestion extends Partial<SuggestionResult> {
    word: string;
}

const ac = expect.arrayContaining;

const pAffContent = readRawDictionaryFile('hunspell/en_US.aff');

let affContent: string | undefined;

const pReady = Promise.all([pAffContent.then((aff) => (affContent = aff))]).then(() => {
    return undefined;
});

describe('Validate English Suggestions', () => {
    interface WordSuggestionsTest {
        word: string;
        expected: ExpectedSuggestion[];
    }

    const SEPARATE_WORDS = { compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
    const JOIN_WORDS = { compoundMethod: CompoundWordsMethod.JOIN_WORDS };
    const NONE = { compoundMethod: CompoundWordsMethod.NONE };

    // cspell:ignore emplode ballence catagory dont
    test.each`
        word          | expected
        ${'hello'}    | ${sr({ word: 'hello', cost: 0 })}
        ${'apple'}    | ${sr({ word: 'apple', cost: 0 }, { word: 'apples', cost: 94 })}
        ${'emplode'}  | ${sr('implode')}
        ${'dont'}     | ${sr("don't")}
        ${'ballence'} | ${sr('balance')}
        ${'catagory'} | ${sr('category')}
    `('suggestions for $word', async ({ word, expected }: WordSuggestionsTest) => {
        const trie = await getTrie();
        const x = suggest(trie.root, word);
        expect(x).toEqual(expect.arrayContaining(expected.map((e) => expect.objectContaining(e))));
    });

    test(
        'Tests suggestions "joyful"',
        async () => {
            const trie = await getTrie();
            const collector = suggestionCollector('joyful', opts(8, undefined, 1));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, NONE), timeout);
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
            const collector = suggestionCollector('joyfull', opts(8));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['joyful']));
            expect(suggestions[0]).toBe('joyfully');
            expect(suggestions[1]).toBe('joyful');
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
        },
        timeout
    );

    test(
        'Tests compound SEPARATE_WORDS suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothreefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3.3));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['one two three four']));
            expect(suggestions[0]).toBe('one two three four');
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
        },
        timeout
    );

    test(
        'Tests compound JOIN_WORDS suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, JOIN_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
        },
        timeout
    );

    test(
        'Tests compound suggestions',
        async () => {
            const trie = await getTrie();
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, JOIN_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
        },
        timeout
    );

    // Takes a long time.
    test(
        'Tests long compound suggestions `testscomputesuggestions`',
        async () => {
            const trie = await getTrie();
            // cspell:ignore testscomputesuggestions
            const collector = suggestionCollector('testscomputesuggestions', opts(2, undefined, 3, true));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
            expect(suggestions).toEqual(['tests compute suggestions', 'test compute suggestions']);
            expect(suggestions[0]).toBe('tests compute suggestions');
        },
        timeout
    );

    // Takes a long time.
    test(
        'Tests long compound suggestions `testscompundsuggestions`',
        async () => {
            const trie = await getTrie();
            // cspell:ignore testscompundsuggestions
            const collector = suggestionCollector('testscompundsuggestions', opts(1, undefined, 3));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS), timeout);
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toHaveLength(collector.maxNumSuggestions);
            expect(suggestions).toEqual(expect.arrayContaining(['tests compound suggestions']));
            expect(suggestions[0]).toBe('tests compound suggestions');
        },
        timeout
    );

    test(
        'Expensive suggestion `testscompundsuggestions`',
        async () => {
            const suggestionTimeout = 100;
            const trie = await getTrie();
            // cspell:ignore testscompundsuggestions
            const collector = suggestionCollector('testscompundsuggestions', opts(1, undefined, 3));
            const timer = createTimer();
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS), suggestionTimeout);
            const elapsed = timer.elapsed();
            expect(elapsed).toBeLessThan(suggestionTimeout * 4);
        },
        timeout
    );

    test.each`
        word        | expected
        ${''}       | ${[]}
        ${'mexico'} | ${[s('Mexico', 1), s('medico', 100), s('Mexican', 151), s("Mexico's", 191)]}
        ${'boat'}   | ${ac([s('boat', 0), s('boar', 100), s('boast', 100)])}
    `('Suggestions with weightMap', async ({ word, expected }) => {
        await pReady;
        const trie = await getTrie();
        const opts: SuggestionOptions = {
            numSuggestions: 4,
            ignoreCase: false,
            weightMap: weightMapFromAff(),
        };
        const r = trie.suggestWithCost(word, opts);
        expect(r).toEqual(expected);
    });
});

function opts(
    numSuggestions: number,
    filter?: SuggestionCollectorOptions['filter'],
    changeLimit?: number,
    includeTies?: boolean,
    ignoreCase?: boolean
): SuggestionCollectorOptions {
    return clean({
        numSuggestions,
        filter,
        changeLimit,
        includeTies,
        ignoreCase,
        timeout,
    });
}

function s(word: string, cost?: number): ExpectedSuggestion {
    const sug: ExpectedSuggestion = { word };
    if (cost !== undefined) {
        sug.cost = cost;
    }
    return sug;
}

function sr(...sugs: (string | ExpectedSuggestion)[]): ExpectedSuggestion[] {
    return sugs.map((s) => {
        if (typeof s === 'string') return { word: s };
        return s;
    });
}

const defaultDictInfo: DictionaryInformation = {
    locale: 'en-US',
    suggestionEditCosts: [
        {
            map: 'aeiou', // cspell:ignore aeiou
            replace: 50,
            insDel: 50,
            swap: 50,
        },
        {
            map: 'o(oo)|a(aa)|e(ee)|u(uu)|(eu)(uu)|(ou)(ui)|(ie)(ei)|i(ie)|e(en)|e(ie)',
            replace: 45,
        },
        {
            description: "Do not rank `'s` high on the list.",
            map: "($)('$)('s$)|(s$)(s'$)(s's$)",
            replace: 10,
            penalty: 180,
        },
        {
            map: '(eur)(uur)',
            replace: 40,
        },
        {
            map: '(d$)(t$)(dt$)',
            replace: 30,
        },
    ],
};

let __weightMapFromAff: WeightMap | undefined;

function weightMapFromAff(): WeightMap {
    if (__weightMapFromAff) return __weightMapFromAff;
    assert(affContent);

    const di: DictionaryInformation = {
        ...defaultDictInfo,
        hunspellInformation: {
            aff: affContent,
        },
    };

    return (__weightMapFromAff = mapDictionaryInformationToWeightMap(di));
}
