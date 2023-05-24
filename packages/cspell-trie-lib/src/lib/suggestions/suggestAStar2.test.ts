import { describe, expect, test } from 'vitest';

import { parseDictionary } from '../SimpleDictionaryParser.js';
import { createTrieFromList } from '../TrieNode/trie-util.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { CompoundWordsMethod } from '../walker/index.js';
import type { SuggestionOptions } from './genSuggestionsOptions.js';
import * as Sug from './suggestAStar2.js';

describe('Validate Suggest', () => {
    const changeLimit = 3;

    const trie = createTrieFromWords(sampleWords);

    // cspell:ignore joyfullwalk
    test('Tests suggestions for valid word talks', () => {
        const results = Sug.suggestAStar(trie, 'talks', { changeLimit: changeLimit });
        expect(results).toEqual([
            { cost: 0, word: 'talks' },
            { cost: 100, word: 'talk' },
            { cost: 125, word: 'walks' },
            { cost: 200, word: 'talked' },
            { cost: 200, word: 'talker' },
            { cost: 225, word: 'walk' },
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
        expect(suggestions).toEqual(['talk', 'talks', 'walk', 'talked', 'talker', 'walks']);
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

    // cspell:ignore walkingtree talkingtree
    test.skip.each`
        word              | expected
        ${'walkingstick'} | ${expect.arrayContaining([{ word: 'walkingstick', cost: 99 }])}
        ${'walkingtree'}  | ${expect.arrayContaining([])}
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
});

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
];

function createTrieFromWords(words: string[]) {
    return new TrieNodeTrie(createTrieFromList(words));
}

function parseDict(dict: string) {
    const trie = parseDictionary(dict);
    return new TrieNodeTrie(trie.root);
}
