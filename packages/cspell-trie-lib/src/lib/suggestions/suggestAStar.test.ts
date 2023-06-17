import assert from 'assert';
import { describe, expect, test } from 'vitest';

import type { WeightMap } from '../distance/index.js';
import { mapDictionaryInformationToWeightMap } from '../mappers/mapDictionaryInfoToWeightMap.js';
import { parseDictionaryLegacy } from '../SimpleDictionaryParser.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { CompoundWordsMethod } from '../walker/index.js';
import type { SuggestionOptions } from './genSuggestionsOptions.js';
import * as Sug from './suggestAStar.js';

// const oc = expect.objectContaining;
const ac = expect.arrayContaining;

describe('Validate Suggest A Star', () => {
    const changeLimit = 3;

    const trie = createTrieFromWords(sampleWords);

    // cspell:ignore joyfullwalk
    test('Tests suggestions for valid word talks', () => {
        const results = Sug.suggestAStar(trie, 'talks', { changeLimit: changeLimit });
        expect(results).toEqual([
            { cost: 0, word: 'talks' },
            { cost: 96, word: 'talk' },
            { cost: 105, word: 'walks' },
            { cost: 191, word: 'talked' },
            { cost: 191, word: 'talker' },
            { cost: 201, word: 'walk' },
        ]);
    });

    test('Tests suggestions for valid word', () => {
        const results = Sug.suggestAStar(trie, 'talks', { changeLimit: changeLimit });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[0]).toBe('talks');
        expect(suggestions[1]).toBe('talk');
        expect(suggestions).toEqual(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
    });

    test('Tests suggestions for invalid word', () => {
        // cspell:ignore tallk
        const results = Sug.suggestAStar(trie, 'tallk', {});
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[1]).toBe('talks');
        expect(suggestions[0]).toBe('talk');
        expect(suggestions).toEqual(['talk', 'talks', 'walk']);
    });

    // cspell:ignore jernals
    test('Tests suggestions jernals', () => {
        const results = Sug.suggestAStar(trie, 'jernals', {});
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal']);
    });

    // cspell:ignore juornals
    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const results = Sug.suggestAStar(trie, 'juornals', { changeLimit: changeLimit });
        // console.warn('%o', results);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist']);
    });

    test('Tests suggestions for joyfull', () => {
        const results = Sug.suggestAStar(trie, 'joyfull', { changeLimit: changeLimit });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyfullest', 'joyous']);
    });

    test('Tests suggestions', () => {
        const results = Sug.suggestAStar(trie, '', {});
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual([]);
    });

    // cspell:ignore joyfull
    test('Tests suggestions with low max num', () => {
        const results = Sug.suggestAStar(trie, 'joyfull', { numSuggestions: 2 });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully']);
    });

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const opts: SuggestionOptions = { numSuggestions: 1, compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
        const results = Sug.suggestAStar(trie, 'walkingtalkingjoy', opts);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
    });

    // cspell:ignore walkingtree talkingtree talkingstick
    test.each`
        word              | expected
        ${'walkingstick'} | ${[{ word: 'walkingstick', cost: 1 }]}
        ${'talkingstick'} | ${[{ word: 'talkingstick', cost: 1 }]}
        ${'talkingtree'}  | ${[{ word: 'talkingtree', cost: 1 }]}
        ${'walkingtree'}  | ${[{ word: 'walkingtree', cost: 1 } /* still suggested even if it is forbidden */]}
    `('that forbidden words are not included (collector)', ({ word, expected }) => {
        const trie = parseDict(`
            walk
            walking*
            *stick
            talking*
            *tree
            !walkingtree
        `);
        const r = Sug.suggestAStar(trie, word, { numSuggestions: 1 });
        expect(r).toEqual(expected);
    });

    test.each`
        a                   | b                   | expected
        ${{ c: 100, i: 0 }} | ${{ c: 100, i: 0 }} | ${0}
        ${{ c: 0, i: 0 }}   | ${{ c: 100, i: 0 }} | ${-1}
        ${{ c: 100, i: 1 }} | ${{ c: 100, i: 0 }} | ${-1}
        ${{ c: 200, i: 1 }} | ${{ c: 100, i: 0 }} | ${-1}
        ${{ c: 100, i: 0 }} | ${{ c: 0, i: 0 }}   | ${1}
        ${{ c: 100, i: 0 }} | ${{ c: 100, i: 1 }} | ${1}
        ${{ c: 100, i: 0 }} | ${{ c: 200, i: 1 }} | ${1}
    `('comparePath $a $b', ({ a, b, expected }) => {
        const v = Sug.__testing__.comparePath(a, b);
        expect(nCompare(v)).toBe(expected);
    });
});

describe('weights', () => {
    const changeLimit = 3;
    const trie = createTrieFromWords(sampleWords);
    const searchTrieCostNodesMatchingWord = Sug.__testing__.searchTrieCostNodesMatchingWord;
    const weightedDeleteCosts = Sug.__testing__.weightedDeleteCosts;
    const weightedInsertCosts = Sug.__testing__.weightedInsertCosts;
    const weightedReplaceCosts = Sug.__testing__.weightedReplaceCosts;
    const weightMap = calcWeightMap();

    test.each`
        word       | index | expected
        ${'apple'} | ${0}  | ${[{ i: 1, t: { c: 90 } }]}
    `('searchTrieCostNodesMatchingWord $word $index', ({ word, index, expected }) => {
        const result = [...searchTrieCostNodesMatchingWord(weightMap.insDel, word, index)];
        // console.warn('%o', result);
        expect(result).toEqual(expected);
    });

    test.each`
        word       | index | expected
        ${'apple'} | ${0}  | ${[{ i: 1, c: 90 }]}
    `('weightedDeleteCosts $word $index', ({ word, index, expected }) => {
        const result = [...weightedDeleteCosts(weightMap, word, index)];
        // console.warn('%o', result);
        expect(result).toEqual(expected);
    });

    test.each`
        prefix | expected
        ${'t'} | ${[{ c: 90, s: 'a' }]}
        ${'w'} | ${ac([{ c: 90, s: 'a' }, { c: 70, s: 'h' }, { c: 90, s: 'i' }, { c: 90, s: 'o' }, { c: 100, s: 'r' }])}
    `('weightedInsertCosts $prefix', ({ prefix, expected }) => {
        const node = trie.getNode(prefix);
        assert(node);
        const result = [...weightedInsertCosts(weightMap, node)].map((v) => ({ ...v, n: undefined }));
        // console.warn('%o', result);
        expect(result).toEqual(expected);
    });

    function rc(i: number, c: number, s: string) {
        const values = s.split('|');
        return values.map((s) => ({ i, c, s }));
    }

    test.each`
        word          | index | expected
        ${'apple'}    | ${0}  | ${[...rc(1, 100, 'w|t|l|j|m|g|s|r'), ...rc(1, 98, 'i')]}
        ${'relasion'} | ${4}  | ${[{ i: 5, c: 100, s: 't' }, { i: 8, c: 75, s: 'tion' }] /* cspell:disable-line */}
    `(
        'weightedReplaceCosts $word $index',
        ({ word, index, expected }: { word: string; index: number; expected: unknown }) => {
            const prefix = word.slice(0, index);
            const node = trie.getNode(prefix);
            assert(node);
            const result = [...weightedReplaceCosts(weightMap, word, index, node)].map((v) => ({ ...v, n: undefined }));
            // console.warn('%o', result);
            expect(result).toEqual(expected);
        }
    );

    test('Tests suggestions for joyfull', () => {
        const results = Sug.suggestAStar(trie, 'joyfull', { changeLimit, weightMap });
        const suggestions = results.map((s) => s.word);
        // console.warn('W %o', results);
        // console.warn('X %o', Sug.suggestAStar(trie, 'joyfull', { changeLimit }));
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyfullest']);
    });
});

function nCompare(v: number): 1 | 0 | -1 {
    if (v < 0) return -1;
    if (v > 0) return 1;
    return 0;
}

const sampleWords = [
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'talk',
    'talks',
    'talked',
    'talker',
    'talking',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'journal',
    'journals',
    'journalism',
    'journalist',
    'journalistic',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfully',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
    'work',
    'will',
    'write',
    'what',
    'meet',
    'great',
    'seat',
    'met',
    'relation',
    'revelation',
    'salvation',
    'intrusion',
];

function createTrieFromWords(words: string[]) {
    return TrieNodeTrie.createFromWords(words);
}

function parseDict(dict: string) {
    const trie = parseDictionaryLegacy(dict);
    return new TrieNodeTrie(trie.root);
}

function calcWeightMap(): WeightMap {
    // cspell:ignore tion aeiou
    return mapDictionaryInformationToWeightMap({
        locale: 'en-US',
        alphabet: 'a-zA-Z',
        suggestionEditCosts: [
            { description: "Words like 'break' and 'brake'", map: '(ate)(eat)|(ake)(eak)', replace: 75 },
            {
                description: 'Sounds alike',
                map: 'f(ph)(gh)|(sion)(tion)(cion)|(ail)(ale)|(r)(ur)(er)(ure)(or)',
                replace: 75,
            },
            {
                description: 'Double letter score',
                map: 'l(ll)|s(ss)|t(tt)|e(ee)|b(bb)|d(dd)',
                replace: 75,
            },
            {
                map: 'aeiou',
                replace: 98,
                swap: 75,
                insDel: 90,
            },
            {
                description: 'silent letters',
                map: 'h',
                insDel: 70,
            },
            {
                description: 'Common vowel sounds.',
                map: 'o(oh)(oo)|(oo)(ou)|(oa)(ou)|(ee)(ea)',
                replace: 75,
            },
            {
                map: 'o(oo)|a(aa)|e(ee)|u(uu)|(eu)(uu)|(ou)(ui)(ow)|(ie)(ei)|i(ie)|e(en)|e(ie)',
                replace: 50,
            },
            {
                description: "Do not rank `'s` high on the list.",
                map: "($)('$)('s$)|(s$)(s'$)(s's$)",
                replace: 10,
                penalty: 180,
            },
            {
                description: "Plurals ending in 'y'",
                map: '(ys)(ies)',
                replace: 75,
            },
            {
                map: '(d$)(t$)(dt$)',
                replace: 75,
            },
        ],
    });
}
