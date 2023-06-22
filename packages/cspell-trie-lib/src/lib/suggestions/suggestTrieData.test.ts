import { describe, expect, test } from 'vitest';

import { ITrieImpl } from '../ITrie.js';
import { parseDictionaryLegacy } from '../SimpleDictionaryParser.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { cleanCopy } from '../utils/util.js';
import { CompoundWordsMethod } from '../walker/index.js';
import type { GenSuggestionOptions, SuggestionOptions } from './genSuggestionsOptions.js';
import {
    compSuggestionResults,
    isSuggestionResult,
    suggestionCollector,
    type SuggestionCollectorOptions,
} from './suggestCollector.js';
import { genSuggestions, suggest } from './suggestTrieData.js';

describe('Validate Suggest', () => {
    const SEPARATE_WORDS: GenSuggestionOptions = { compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
    const JOIN_WORDS: GenSuggestionOptions = { compoundMethod: CompoundWordsMethod.JOIN_WORDS };

    test('Tests suggestions for valid word', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'talks');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[0]).toBe('talks');
        expect(suggestions[1]).toBe('talk');
        expect(suggestions).toEqual(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
    });

    test('Tests suggestions for invalid word', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        // cspell:ignore tallk
        const results = suggest(trie, 'tallk');
        // console.warn('%o', results);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[1]).toBe('talks');
        expect(suggestions[0]).toBe('talk');
        expect(suggestions).toEqual(['talk', 'talks', 'walk']);
    });

    // cspell:ignore jernals
    test('Tests suggestions jernals', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'jernals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal']);
    });

    // cspell:ignore juornals
    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'juornals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist', 'journey', 'jovial']);
    });

    test('Tests suggestions for joyfull', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'joyfull');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']);
    });

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'walkingtalkingjoy', { ...numSugs(1), ...SEPARATE_WORDS });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
    });

    test('Tests suggestions', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, '');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual([]);
    });

    // cspell:ignore joyfull
    test('Tests suggestions with low max num', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const results = suggest(trie, 'joyfull', { numSuggestions: 3 });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller']);
    });

    test('Tests genSuggestions', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector(
            'joyfull',
            sugOpts({
                numSuggestions: 3,
                filter: (word) => word !== 'joyfully',
            })
        );
        collector.collect(genSuggestions(trie, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(expect.not.arrayContaining(['joyfully']));
        expect(suggestions).toEqual(['joyful', 'joyfuller', 'joyous']);
        expect(collector.maxCost).toBeLessThanOrEqual(300);
    });

    test('Tests genSuggestions wanting 0', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(0));
        collector.collect(genSuggestions(trie, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions wanting -10', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(-10));
        collector.collect(genSuggestions(trie, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions as array', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const sugs = [...genSuggestions(trie, 'joyfull')].filter(isSuggestionResult);
        const sr = sugs.sort(compSuggestionResults);
        const suggestions = sr.map((s) => s && s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']);
    });

    // cspell:ignore joyfullwalk
    test('Tests genSuggestions with compounds SEPARATE_WORDS', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(genSuggestions(trie, collector.word, SEPARATE_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['joyful walk', 'joyfully walk', 'joyful talk']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk, joyfullywalks
    test('Tests genSuggestions with compounds JOIN_WORDS', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(genSuggestions(trie, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['joyful+walk', 'joyfully+walk', 'joyful+talk']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    test('Tests the collector with filter', () => {
        const collector = suggestionCollector(
            'joyfull',
            sugOpts({ numSuggestions: 3, filter: (word) => word !== 'joyfully' })
        );
        collector.add({ word: 'joyfully', cost: 100 }).add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions).toHaveLength(1);
    });

    test('Tests the collector with duplicate words of different costs', () => {
        const collector = suggestionCollector(
            'joyfull',
            sugOpts({ numSuggestions: 3, filter: (word) => word !== 'joyfully' })
        );
        collector.add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions.length).toBe(1);
        collector.add({ word: 'joyful', cost: 75 });
        expect(collector.suggestions.length).toBe(1);
        expect(collector.suggestions[0].cost).toBe(75);
        collector
            .add({ word: 'joyfuller', cost: 200 })
            .add({ word: 'joyfullest', cost: 300 })
            .add({ word: 'joyfulness', cost: 340 })
            .add({ word: 'joyful', cost: 85 });
        expect(collector.suggestions.length).toBe(3);
        expect(collector.suggestions[0].cost).toBe(75);
    });

    // cspell:ignore wålk
    test('that accents are closer', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('wålk', sugOptsMaxNum(3));
        collector.collect(genSuggestions(trie, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        // console.log('%o', collector.suggestions);
        expect(suggestions).toEqual(['walk', 'walks', 'talk']);
    });

    // cspell:ignore wâlkéd
    test('that multiple accents are closer', () => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        const collector = suggestionCollector('wâlkéd', sugOptsMaxNum(3));
        collector.collect(genSuggestions(trie, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walked', 'walker', 'talked']);
    });

    function sr(word: string, cost: number) {
        return { word, cost };
    }

    // cspell:ignore walking* *tree talking* *stick running* *pod *trick
    test.each`
        word              | ignoreCase   | numSuggestions | changeLimit  | expected
        ${'WALK'}         | ${false}     | ${4}           | ${1}         | ${[sr('walk', 4)]}
        ${'WALKing'}      | ${true}      | ${4}           | ${1}         | ${[sr('walking', 4)]}
        ${'Runningpod'}   | ${false}     | ${4}           | ${1}         | ${[sr('RunningPod', 2)]}
        ${'runningtree'}  | ${undefined} | ${2}           | ${undefined} | ${[sr('runningtree', 1), sr('Runningtree', 2)]}
        ${'Runningpod'}   | ${undefined} | ${5}           | ${1}         | ${[sr('Runningpod', 1), sr('runningpod', 2), sr('RunningPod', 2), sr('runningPod', 3)]}
        ${'runningpod'}   | ${undefined} | ${2}           | ${undefined} | ${[sr('runningpod', 1), sr('runningPod', 2)]}
        ${'walkingstick'} | ${undefined} | ${2}           | ${undefined} | ${[sr('walkingstick', 1), sr('talkingstick', 106)]}
        ${'walkingtree'}  | ${undefined} | ${5}           | ${undefined} | ${[sr('talkingtree', 106), sr('walking', 400), sr('walkingpod', 401), sr('walkingPod', 401), sr('walkingstick', 401)]}
        ${'running'}      | ${undefined} | ${2}           | ${undefined} | ${[sr('running', 0), sr('Running', 1)]}
    `(
        'suggestion results $word ic: $ignoreCase ns: $numSuggestions limit: $changeLimit',
        ({ word, ignoreCase, numSuggestions, changeLimit, expected }) => {
            const trie = parseDict(`
            walk
            Running*
            walking*
            *stick
            talking*
            *tree
            +Pod
            !walkingtree
        `);
            const collector = suggestionCollector(word, sugOpts({ numSuggestions, changeLimit, ignoreCase }));
            trie.genSuggestions(collector);
            const r = collector.suggestions;
            expect(r).toEqual(expected);
        }
    );

    test.each`
        word              | ignoreCase   | numSuggestions | changeLimit | expected
        ${'runningtree'}  | ${undefined} | ${2}           | ${3}        | ${[sr('runningtree', 0), sr('Runningtree', 1)]}
        ${'Runningpod'}   | ${undefined} | ${4}           | ${1}        | ${[sr('Runningpod', 0), sr('runningpod', 1), sr('RunningPod', 1), sr('runningPod', 2)]}
        ${'Runningpod'}   | ${false}     | ${4}           | ${1}        | ${[sr('RunningPod', 1)]}
        ${'runningpod'}   | ${undefined} | ${4}           | ${1}        | ${[sr('runningpod', 0), sr('runningPod', 1), sr('Runningpod', 1), sr('RunningPod', 2)]}
        ${'runningpod'}   | ${false}     | ${4}           | ${1}        | ${[sr('RunningPod', 2)]}
        ${'walkingstick'} | ${undefined} | ${2}           | ${3}        | ${[sr('walkingstick', 0), sr('talkingstick', 99)]}
        ${'walkingtree'}  | ${undefined} | ${2}           | ${4}        | ${[sr('talkingtree', 99), sr('walkingstick', 359)]}
        ${'talkingtrick'} | ${undefined} | ${2}           | ${4}        | ${[sr('talkingstick', 183), sr('talkingtree', 268)]}
        ${'running'}      | ${undefined} | ${2}           | ${3}        | ${[sr('running', 0), sr('Running', 1)]}
        ${'free'}         | ${undefined} | ${2}           | ${2}        | ${[sr('tree', 99)]}
        ${'stock'}        | ${undefined} | ${2}           | ${2}        | ${[sr('stick', 97)]}
    `('suggestWithCost results $word', ({ word, ignoreCase, numSuggestions, changeLimit, expected }) => {
        const trie = parseDictionaryLegacy(`
            walk
            Running*
            walking*
            *stick
            talking*
            *tree
            +Pod
            !walkingtree
        `);
        const r = trie.suggestWithCost(word, { numSuggestions, ignoreCase, changeLimit });
        expect(r).toEqual(expected);
    });

    // cspell:ignore stretwise
    test.each`
        word              | ignoreCase   | numSuggestions | changeLimit | expected
        ${'runningtree'}  | ${undefined} | ${2}           | ${3}        | ${[sr('running•tree', 0), sr('Running•tree', 1)]}
        ${'Runningpod'}   | ${undefined} | ${4}           | ${1}        | ${[sr('Running•pod', 0), sr('running•pod', 1), sr('Running•Pod', 1), sr('running•Pod', 2)]}
        ${'Runningpod'}   | ${false}     | ${4}           | ${1}        | ${[sr('Running•Pod', 1)]}
        ${'runningpod'}   | ${undefined} | ${4}           | ${1}        | ${[sr('running•pod', 0), sr('running•Pod', 1), sr('Running•pod', 1), sr('Running•Pod', 2)]}
        ${'runningpod'}   | ${false}     | ${4}           | ${1}        | ${[sr('Running•Pod', 2)]}
        ${'walkingpod'}   | ${undefined} | ${2}           | ${3}        | ${[sr('walking•pod', 0), sr('walking•Pod', 1)]}
        ${'walkingstick'} | ${undefined} | ${2}           | ${3}        | ${[sr('walking•stick', 0), sr('talking•stick', 99)]}
        ${'walkingtree'}  | ${undefined} | ${2}           | ${4}        | ${[sr('talking•tree', 99), sr('walking•wise', 273) /*, sr('walking•stick', 359) */]}
        ${'talkingtrick'} | ${undefined} | ${2}           | ${4}        | ${[sr('talking•stick', 183), sr('talking•tree', 268)]}
        ${'running'}      | ${undefined} | ${2}           | ${3}        | ${[sr('running', 0), sr('Running', 1)]}
        ${'free'}         | ${undefined} | ${2}           | ${2}        | ${[sr('tree', 99)]}
        ${'stock'}        | ${undefined} | ${2}           | ${2}        | ${[sr('stick', 97)]}
        ${'stretwise'}    | ${undefined} | ${2}           | ${2}        | ${[sr('streetwise', 95), sr('street•wise', 95)]}
    `('suggestWithCost and separator $word', ({ word, ignoreCase, numSuggestions, changeLimit, expected }) => {
        const trie = parseDictionaryLegacy(`
            walk
            Running*
            walking*
            *stick
            street*
            *wise
            streetwise
            barman
            talking*
            *tree
            +Pod
            !walkingtree
            !walking+
        `);
        const r = trie.suggestWithCost(word, {
            numSuggestions,
            ignoreCase,
            changeLimit,
            compoundSeparator: '•',
            timeout: 1000000,
        });
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

function parseDict(dict: string) {
    const trie = parseDictionaryLegacy(dict);
    return new ITrieImpl(new TrieNodeTrie(trie.root));
}

function numSugs(numSuggestions: number): SuggestionOptions {
    return { numSuggestions };
}

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
    timeout: undefined,
};

function sugOpts(opts: Partial<SuggestionCollectorOptions>): SuggestionCollectorOptions {
    return {
        ...defaultOptions,
        ...cleanCopy(opts),
    };
}

function sugOptsMaxNum(maxNumSuggestions: number): SuggestionCollectorOptions {
    return sugOpts({ numSuggestions: maxNumSuggestions });
}
