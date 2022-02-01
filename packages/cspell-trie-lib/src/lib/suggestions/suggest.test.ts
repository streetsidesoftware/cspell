import { GenSuggestionOptions, SuggestionOptions } from './genSuggestionsOptions';
import { parseDictionary } from '../SimpleDictionaryParser';
import { Trie } from '../trie';
import { cleanCopy } from '../utils/util';
import * as Walker from '../walker';
import { genCompoundableSuggestions, genSuggestions, suggest } from './suggest';
import {
    compSuggestionResults,
    isSuggestionResult,
    suggestionCollector,
    SuggestionCollectorOptions,
} from './suggestCollector';

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
    timeout: undefined,
};

describe('Validate Suggest', () => {
    const SEPARATE_WORDS: GenSuggestionOptions = { compoundMethod: Walker.CompoundWordsMethod.SEPARATE_WORDS };
    const JOIN_WORDS: GenSuggestionOptions = { compoundMethod: Walker.CompoundWordsMethod.JOIN_WORDS };

    test('Tests suggestions for valid word', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'talks');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[0]).toBe('talks');
        expect(suggestions[1]).toBe('talk');
        expect(suggestions).toEqual(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
    });

    test('Tests suggestions for invalid word', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore tallk
        const results = suggest(trie.root, 'tallk');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['talks']));
        expect(suggestions).toEqual(expect.arrayContaining(['talk']));
        expect(suggestions[1]).toBe('talks');
        expect(suggestions[0]).toBe('talk');
        expect(suggestions).toEqual(['talk', 'talks', 'walk']);
    });

    // cspell:ignore jernals
    test('Tests suggestions jernals', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'jernals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal']);
    });

    // cspell:ignore juornals
    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'juornals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist', 'journey', 'jovial']);
    });

    test('Tests suggestions for joyfull', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'joyfull');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'walkingtalkingjoy', { ...numSugs(1), ...SEPARATE_WORDS });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
    });

    test('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, '');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual([]);
    });

    // cspell:ignore joyfull
    test('Tests suggestions with low max num', () => {
        const trie = Trie.create(sampleWords);
        const results = suggest(trie.root, 'joyfull', { numSuggestions: 3 });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyfully', 'joyful', 'joyfuller']);
    });

    test('Tests genSuggestions', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector(
            'joyfull',
            sugOpts({
                numSuggestions: 3,
                filter: (word) => word !== 'joyfully',
            })
        );
        collector.collect(genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(expect.not.arrayContaining(['joyfully']));
        expect(suggestions).toEqual(['joyful', 'joyfuller', 'joyfullest']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    test('Tests genSuggestions wanting 0', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(0));
        collector.collect(genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions wanting -10', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(-10));
        collector.collect(genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions as array', () => {
        const trie = Trie.create(sampleWords);
        const sugs = [...genSuggestions(trie.root, 'joyfull')].filter(isSuggestionResult);
        const sr = sugs.sort(compSuggestionResults);
        const suggestions = sr.map((s) => s && s.word);
        expect(suggestions).toEqual(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    // cspell:ignore joyfullwalk
    test('Tests genSuggestions with compounds SEPARATE_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, SEPARATE_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['joyful walk', 'joyful walks', 'joyfully walk']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk, joyfullywalks
    test('Tests genSuggestions with compounds JOIN_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['joyful+walk', 'joyful+walks', 'joyfully+walk']);
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
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wålk', sugOptsMaxNum(3));
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walk', 'walks', 'talk']);
    });

    // cspell:ignore wâlkéd
    test('that multiple accents are closer', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wâlkéd', sugOptsMaxNum(3));
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, JOIN_WORDS));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walked', 'walker', 'talked']);
    });

    function sr(word: string, cost: number) {
        return { word, cost };
    }

    // cspell:ignore walking* *tree talking* *stick running* *pod *trick
    test.each`
        word              | ignoreCase   | numSuggestions | changeLimit  | expected
        ${'Runningpod'}   | ${false}     | ${4}           | ${1}         | ${[sr('RunningPod', 1)]}
        ${'runningtree'}  | ${undefined} | ${2}           | ${undefined} | ${[sr('runningtree', 0), sr('Runningtree', 1)]}
        ${'Runningpod'}   | ${undefined} | ${5}           | ${1}         | ${[sr('Runningpod', 0), sr('runningpod', 1), sr('RunningPod', 1), sr('runningPod', 2)]}
        ${'runningpod'}   | ${undefined} | ${2}           | ${undefined} | ${[sr('runningpod', 0), sr('runningPod', 1)]}
        ${'walkingstick'} | ${undefined} | ${2}           | ${undefined} | ${[sr('walkingstick', 0), sr('talkingstick', 99)]}
        ${'walkingtree'}  | ${undefined} | ${2}           | ${undefined} | ${[sr('talkingtree', 99), sr('walkingstick', 359)]}
        ${'running'}      | ${undefined} | ${2}           | ${undefined} | ${[sr('running', 0), sr('Running', 1)]}
    `('test suggestion results $word', ({ word, ignoreCase, numSuggestions, changeLimit, expected }) => {
        const trie = parseDictionary(`
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
    });

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
    `('test suggestWithCost results $word', ({ word, ignoreCase, numSuggestions, changeLimit, expected }) => {
        const trie = parseDictionary(`
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
});

function numSugs(numSuggestions: number): SuggestionOptions {
    return { numSuggestions };
}

function sugOpts(opts: Partial<SuggestionCollectorOptions>): SuggestionCollectorOptions {
    return {
        ...defaultOptions,
        ...cleanCopy(opts),
    };
}

function sugOptsMaxNum(maxNumSuggestions: number): SuggestionCollectorOptions {
    return sugOpts({ numSuggestions: maxNumSuggestions });
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
];
