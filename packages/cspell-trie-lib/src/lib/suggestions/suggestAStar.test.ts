import { GenSuggestionOptionsStrict, SuggestionOptions } from './genSuggestionsOptions';
import { parseDictionary } from '../SimpleDictionaryParser';
import * as Sug from './suggestAStar';
import { SuggestionCollector, suggestionCollector, SuggestionCollectorOptions } from './suggestCollector';
import { Trie } from '../trie';
import { CompoundWordsMethod } from '../walker';
import { clean } from '../trie-util';

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
    includeTies: true,
    timeout: undefined,
};

const stopHere = true;

describe('Validate Suggest', () => {
    const changeLimit = 3;

    // cspell:ignore joyfullwalk
    test('Tests suggestions for valid word talks', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks', { changeLimit: changeLimit });
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
        const results = Sug.suggest(trie.root, 'talks', { changeLimit: changeLimit });
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
        const results = Sug.suggest(trie.root, 'tallk', {});
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
        const results = Sug.suggest(trie.root, 'jernals', {});
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal']);
    });

    // cspell:ignore juornals
    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'juornals', { changeLimit: changeLimit });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['journals', 'journal', 'journalism', 'journalist']);
    });

    test('Tests suggestions for joyfull', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'joyfull', { changeLimit: changeLimit });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully', 'joyfuller', 'joyous', 'joyfullest']);
    });

    test('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, '', {});
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual([]);
    });

    // cspell:ignore joyfull
    test('Tests suggestions with low max num', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'joyfull', { numSuggestions: 2 });
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['joyful', 'joyfully']);
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
        collector.collect(Sug.genSuggestions(trie.root, collector.word, sugGenOptsFromCollector(collector)));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(expect.not.arrayContaining(['joyfully']));
        // We get 4 because they are tied
        expect(suggestions).toEqual(['joyful', 'joyfuller', 'joyous', 'joyfullest']);
        expect(collector.changeLimit).toBeLessThanOrEqual(300);
    });

    test('Tests genSuggestions wanting 0', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(0));
        collector.collect(Sug.genSuggestions(trie.root, collector.word, sugGenOptsFromCollector(collector)));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    test('Tests genSuggestions wanting -10', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfull', sugOptsMaxNum(-10));
        collector.collect(Sug.genSuggestions(trie.root, collector.word, sugGenOptsFromCollector(collector)));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toHaveLength(0);
    });

    // cspell:ignore wålk
    test('that accents are closer', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wålk', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(
                trie.root,
                collector.word,
                sugGenOptsFromCollector(collector, CompoundWordsMethod.JOIN_WORDS)
            )
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walk', 'walks', 'talk']);
    });

    // cspell:ignore wâlkéd
    test('that multiple accents are closer', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wâlkéd', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(
                trie.root,
                collector.word,
                sugGenOptsFromCollector(collector, CompoundWordsMethod.JOIN_WORDS)
            )
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).toEqual(['walked', 'walker', 'talked']);
    });

    // cspell:ignore walkingtalkingjoy
    test('Tests compound suggestions', () => {
        const trie = Trie.create(sampleWords);
        const opts: SuggestionOptions = { numSuggestions: 1, compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
        const results = Sug.suggest(trie.root, 'walkingtalkingjoy', opts);
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toEqual(['walking talking joy']);
    });

    // cspell:ignore joyfullwalk
    test('Tests genSuggestions with compounds SEPARATE_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const ops = sugOpts(sugOptsMaxNum(4), { changeLimit: 4 });
        const collector = suggestionCollector('joyfullwalk', ops);
        collector.collect(
            Sug.genCompoundableSuggestions(
                trie.root,
                collector.word,
                sugGenOptsFromCollector(collector, CompoundWordsMethod.SEPARATE_WORDS)
            )
        );
        expect(collector.suggestions).toEqual([
            { cost: 129, word: 'joyful walk' },
            { cost: 229, word: 'joyful talk' },
            { cost: 229, word: 'joyful walks' },
            { cost: 325, word: 'joyfully' },
        ]);
    });

    // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk, joyfullywalks
    test('Tests genSuggestions with compounds JOIN_WORDS', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('joyfullwalk', sugOptsMaxNum(3));
        collector.collect(
            Sug.genCompoundableSuggestions(
                trie.root,
                collector.word,
                sugGenOptsFromCollector(collector, CompoundWordsMethod.JOIN_WORDS)
            )
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        // expect(suggestions).toEqual(['joyful+walk', 'joyful+talk', 'joyful+walks', 'joyfully+walk']);
        expect(suggestions).toEqual(['joyful+walk', 'joyful+talk', 'joyful+walks']);
        expect(collector.changeLimit).toBeLessThan(300);
    });

    // cspell:ignore walkingtree talkingtree
    test.each`
        word              | expected
        ${'walkingstick'} | ${expect.arrayContaining([{ word: 'walkingstick', cost: 99 }])}
        ${'walkingtree'}  | ${expect.arrayContaining([])}
    `('that forbidden words are not included (collector)', ({ word, expected }) => {
        const trie = parseDictionary(`
            walk
            walking*
            *stick
            talking*
            *tree
            !walkingtree
        `);
        const r = Sug.suggest(trie.root, word, { numSuggestions: 1 });
        expect(r).toEqual(expected);
    });

    if (stopHere) return;
});

function sugOpts(...opts: Partial<SuggestionCollectorOptions>[]): SuggestionCollectorOptions {
    return Object.assign({}, defaultOptions, ...opts);
}

function sugOptsMaxNum(maxNumSuggestions: number): SuggestionCollectorOptions {
    return sugOpts({ numSuggestions: maxNumSuggestions });
}

function sugGenOptsFromCollector(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod) {
    const { ignoreCase, changeLimit } = collector;
    const ops: GenSuggestionOptionsStrict = clean({
        compoundMethod,
        ignoreCase,
        changeLimit,
    });
    return ops;
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
