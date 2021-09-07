import { parseDictionary } from './SimpleDictionaryParser';
import * as Sug from './suggest';
import { suggestionCollector, SuggestionCollectorOptions } from './suggestCollector';
import { Trie } from './trie';
import * as Walker from './walker';

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
};

describe('Validate Suggest', () => {
    test('Tests suggestions for valid word', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks');
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
        const results = Sug.suggest(trie.root, 'tallk');
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
        const results = Sug.suggest(trie.root, 'jernals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal']);
    });

    // cspell:ignore juornals
    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'juornals');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist', 'journey', 'jovial']);
    });

    test('Tests suggestions for joyfull', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'joyfull');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'walkingtalkingjoy', 1, Walker.CompoundWordsMethod.SEPARATE_WORDS);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
    });

    test('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, '');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual([]);
    });

    // cspell:ignore joyfull
    test('Tests suggestions with low max num', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'joyfull', 3);
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
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(expect.not.arrayContaining(['joyfully']));
        expect(suggestions).toEqual(['joyful', 'joyfuller', 'joyfullest']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    test('Tests genSuggestions wanting 0', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(0));
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions wanting -10', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(-10));
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions as array', () => {
        const trie = Trie.create(sampleWords);
        const sugs = [...Sug.genSuggestions(trie.root, 'joyfull')];
        const sr = sugs.sort(Sug.compSuggestionResults);
        const suggestions = sr.map((s) => s && s.word);
        expect(suggestions).toEqual(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    // cspell:ignore joyfullwalk
    test('Tests genSuggestions with compounds SEPARATE_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Walker.CompoundWordsMethod.SEPARATE_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['joyful walk', 'joyful walks', 'joyfully walk']);
        expect(collector.maxCost).toBeLessThan(300);
    });

    // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk, joyfullywalks
    test('Tests genSuggestions with compounds JOIN_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Walker.CompoundWordsMethod.JOIN_WORDS)
        );
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
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Walker.CompoundWordsMethod.JOIN_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walk', 'walks', 'talk']);
    });

    // cspell:ignore wâlkéd
    test('that multiple accents are closer', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wâlkéd', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Walker.CompoundWordsMethod.JOIN_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walked', 'walker', 'talked']);
    });

    // cspell:ignore walkingtree talkingtree
    test('that forbidden words are not included (collector)', () => {
        const trie = parseDictionary(`
            walk
            walking*
            *stick
            talking*
            *tree
            !walkingtree
        `);
        expect(trie.suggest('walkingstick', 1)).toEqual(['walkingstick']);
        expect(trie.suggest('walkingtree', 1)).toEqual([]);
        expect(trie.suggest('walking*', 1)).toEqual(['walking']);
        const collector = suggestionCollector('walkingtree', sugOptsMaxNum(2));
        trie.genSuggestions(collector);
        expect(collector.suggestions).toEqual([
            { word: 'talkingtree', cost: 99 },
            { word: 'walkingstick', cost: 359 },
        ]);
    });
});

function sugOpts(opts: Partial<SuggestionCollectorOptions>): SuggestionCollectorOptions {
    return {
        ...defaultOptions,
        ...opts,
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
