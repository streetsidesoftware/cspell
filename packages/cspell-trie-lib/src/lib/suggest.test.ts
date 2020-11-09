/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import * as Sug from './suggest';
import { Trie } from './trie';

describe('Validate Suggest', () => {
    test('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[0]).to.be.equal('talks');
        expect(suggestions[1]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
    });

    test('Tests suggestions 2', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore tallk
        const results = Sug.suggest(trie.root, 'tallk');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[1]).to.be.equal('talks');
        expect(suggestions[0]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talk', 'talks', 'walk']);
    });

    test('Tests suggestions 3', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore jernals
        const results = Sug.suggest(trie.root, 'jernals');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal(['journals', 'journal']);
    });

    test('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore juornals
        const results = Sug.suggest(trie.root, 'juornals');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal(['journals', 'journal', 'journalism', 'journalist', 'journey', 'jovial']);
    });

    test('Tests suggestions 4', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfull
        const results = Sug.suggest(trie.root, 'joyfull');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    test('Tests compound suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore walkingtalkingjoy
        const results = Sug.suggest(trie.root, 'walkingtalkingjoy', 1, Sug.CompoundWordsMethod.SEPARATE_WORDS);
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal(['walking talking joy']);
    });

    test('Tests suggestions 5', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, '');
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal([]);
    });

    test('Tests suggestions with low max num', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfull
        const results = Sug.suggest(trie.root, 'joyfull', 3);
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.deep.equal(['joyfully', 'joyful', 'joyfuller']);
    });

    test('Tests genSuggestions', () => {
        const trie = Trie.create(sampleWords);
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.not.contain('joyfully');
        expect(suggestions).to.deep.equal(['joyful', 'joyfuller', 'joyfullest']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    test('Tests genSuggestions wanting 0', () => {
        const trie = Trie.create(sampleWords);
        const collector = Sug.suggestionCollector('joyfull', 0);
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.be.length(0);
    });

    test('Tests genSuggestions wanting -10', () => {
        const trie = Trie.create(sampleWords);
        const collector = Sug.suggestionCollector('joyfull', -10);
        collector.collect(Sug.genSuggestions(trie.root, collector.word));
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.be.length(0);
    });

    test('Tests genSuggestions as array', () => {
        const trie = Trie.create(sampleWords);
        const sugs = [...Sug.genSuggestions(trie.root, 'joyfull')];
        const sr = sugs.sort(Sug.compSuggestionResults);
        const suggestions = sr.map((s) => s && s.word);
        expect(suggestions).to.deep.equal(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    test('Tests genSuggestions with compounds', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfullwalk
        const collector = Sug.suggestionCollector('joyfullwalk', 3);
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundWordsMethod.SEPARATE_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.deep.equal(['joyful walk', 'joyful walks', 'joyfully walk']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    test('Tests genSuggestions with compounds 2', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk, joyfullywalks
        const collector = Sug.suggestionCollector('joyfullwalk', 3);
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundWordsMethod.JOIN_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.deep.equal(['joyful+walk', 'joyful+walks', 'joyfully+walk']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    test('Tests the collector with filter', () => {
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        collector.add({ word: 'joyfully', cost: 100 }).add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions).to.be.length(1);
    });

    test('Tests the collector with duplicate words of different costs', () => {
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        collector.add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions.length).to.be.equal(1);
        collector.add({ word: 'joyful', cost: 75 });
        expect(collector.suggestions.length).to.be.equal(1);
        expect(collector.suggestions[0].cost).to.be.equal(75);
        collector
            .add({ word: 'joyfuller', cost: 200 })
            .add({ word: 'joyfullest', cost: 300 })
            .add({ word: 'joyfulness', cost: 340 })
            .add({ word: 'joyful', cost: 85 });
        expect(collector.suggestions.length).to.be.equal(3);
        expect(collector.suggestions[0].cost).to.be.equal(75);
    });

    test('that accents are closer', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore wålk
        const collector = Sug.suggestionCollector('wålk', 3);
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundWordsMethod.JOIN_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.deep.equal(['walk', 'walks', 'talk']);
    });

    test('that accents are closer 2', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore wâlkéd
        const collector = Sug.suggestionCollector('wâlkéd', 3);
        collector.collect(
            Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundWordsMethod.JOIN_WORDS)
        );
        const suggestions = collector.suggestions.map((s) => s.word);
        expect(suggestions).to.deep.equal(['walked', 'walker', 'talked']);
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
