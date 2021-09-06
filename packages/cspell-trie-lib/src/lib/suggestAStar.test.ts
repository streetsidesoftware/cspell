import { suggestionCollector } from '.';
import { parseDictionary } from './SimpleDictionaryParser';
import { SuggestionCollectorOptions } from './suggest';
import * as Sug from './suggestAStar';
import { Trie } from './trie';
import * as Walker from './walker';

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
    includeTies: true,
};

const stopHere = true;

describe('Validate Suggest', () => {
    test('Tests suggestions for valid word talks', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks');
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
        expect(suggestions).toEqual(['talk', 'talks', 'walk', 'talked', 'talker', 'walks']);
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
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist']);
    });

    test('Tests suggestions for joyfull', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'joyfull');
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']);
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
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller']);
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
        // We get 4 because they are tied
        expect(suggestions).toEqual(['joyful', 'joyfuller', 'joyous', 'joyfullest']);
        expect(collector.maxCost).toBeLessThanOrEqual(300);
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

    if (stopHere) return;

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'walkingtalkingjoy', 1, Walker.CompoundWordsMethod.SEPARATE_WORDS);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
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
