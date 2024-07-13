import { describe, expect, test } from 'vitest';

import type { WeightMap } from '../distance/index.js';
import { mapDictionaryInformationToWeightMap } from '../mappers/mapDictionaryInfoToWeightMap.js';
import { parseDictionaryLegacy } from '../SimpleDictionaryParser.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { CompoundWordsMethod } from '../walker/index.js';
import { collectSuggestions } from './collectSuggestions.js';
import type { SuggestionOptions } from './genSuggestionsOptions.js';
import * as Sug from './suggestAStar.js';
import type { SuggestionResult } from './SuggestionTypes.js';

// const oc = <T>(obj: T) => expect.objectContaining(obj);
// const ac = <T>(a: Array<T>) => expect.arrayContaining(a);

describe('Validate Suggest A Star', () => {
    const changeLimit = 3;

    const trie = createTrieFromWords(sampleWords);

    // cspell:ignore joyfullwalk
    test('Tests suggestions for valid word talks', () => {
        const results = Sug.suggestAStar(trie, 'talks', { changeLimit: changeLimit });
        expect(results).toEqual([
            sr('talks', 0),
            sr('talk', 100),
            sr('walks', 105),
            sr('talked', 200),
            sr('talker', 200),
            sr('walk', 205),
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
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']);
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
    const weightMap = calcWeightMap();

    // cspell:ignore joyles divertion divercion diviztion divizion
    test.each`
        word           | n    | expected
        ${'joyfull'}   | ${5} | ${[sr('joyful', 75), sr('joyfully', 100), sr('joyfuller', 200), sr('joyous', 294), sr('joyfullest', 300)]}
        ${'joyles'}    | ${3} | ${[sr('joyless', 75), sr('joyous', 198), sr('joy', 278)]}
        ${'diversion'} | ${3} | ${[sr('diversion', 0), sr('division', 187)]}
        ${'diviztion'} | ${3} | ${[sr('division', 165), sr('diversion', 268)]}
        ${'divizion'}  | ${3} | ${[sr('division', 70), sr('diversion', 260), sr('decision', 268)]}
        ${'divertion'} | ${3} | ${[sr('diversion', 70), sr('division', 257)]}
        ${'divercion'} | ${3} | ${[sr('diversion', 70), sr('division', 257)]}
    `('Tests suggestions for $word with cost', ({ word, n, expected }) => {
        const gen = Sug.getSuggestionsAStar(trie, word, { changeLimit, weightMap });
        const results = collectSuggestions(gen, changeLimit * 100, n);
        // word === 'divizion' && console.warn('%o %o', word, results);
        expect(results).toEqual(expected);
    });

    test.each`
        word         | expected
        ${'joyfull'} | ${['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']}
    `('Tests suggestions for $word', ({ word, expected }) => {
        const gen = Sug.getSuggestionsAStar(trie, word, { changeLimit, weightMap });
        const results = collectSuggestions(gen, changeLimit * 100, 5);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expected);
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
    'accession',
    'coercions',
    'collision',
    'creation',
    'decision',
    'diversion',
    'division',
    'elation',
    'explanation',
    'expulsion',
    'extrapolation',
    'intrusion',
    'percussion',
    'permission',
    'protrusion',
    'relation',
    'revelation',
    'salvation',
    'suspicion',
    'television',
];

function sr(word: string, cost: number): SuggestionResult {
    return { word, cost };
}

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
                map: 'f(ph)(gh)|(sion)(tion)(cion)(zion)|(ail)(ale)|(r)(ur)(er)(ure)(or)|szc',
                replace: 70,
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
            {
                map: '(ale)(ail)|(eat)(eet)}',
                replace: 70,
            },
        ],
    });
}
