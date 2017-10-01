import {expect} from 'chai';
import * as Sug from './suggest';
import {Trie} from './trie';

describe('Validate Suggest', () => {
    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[0]).to.be.equal('talks');
        expect(suggestions[1]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore tallk
        const results = Sug.suggest(trie.root, 'tallk');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[1]).to.be.equal('talks');
        expect(suggestions[0]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talk', 'talks', 'walk']);
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore jernals
        const results = Sug.suggest(trie.root, 'jernals');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal(['journals', 'journal']);
    });

    it('Tests suggestions for `juornals` (reduced cost for swap)', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore juornals
        const results = Sug.suggest(trie.root, 'juornals');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal([
            'journals',
            'journal',
            'journalism',
            'journalist',
            'journey',
            'jovial',
        ]);
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfull
        const results = Sug.suggest(trie.root, 'joyfull');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal(['joyfully', 'joyful', 'joyfuller', 'joyfullest', 'joyous']);
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, '');
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal([]);
    });

    it('Tests suggestions with low max num', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfull
        const results = Sug.suggest(trie.root, 'joyfull', 3);
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal(['joyfully', 'joyful', 'joyfuller']);
    });

    it('Tests genSuggestions', () => {
        const trie = Trie.create(sampleWords);
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        Sug.genSuggestions(trie.root, collector.word, collector);
        const suggestions = collector.suggestions.map(s => s.word);
        expect(suggestions).to.not.contain('joyfully');
        expect(suggestions).to.deep.equal(['joyful', 'joyfuller', 'joyfullest']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    it('Tests genSuggestions with compounds', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfullwalk
        const collector = Sug.suggestionCollector('joyfullwalk', 3);
        Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundingMethod.SEPARATE_WORDS, collector);
        const suggestions = collector.suggestions.map(s => s.word);
        expect(suggestions).to.deep.equal(['joyful walk', 'joyful walks', 'joyfully walk']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    it('Tests genSuggestions with compounds', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfullwalk joyfulwalk joyfulwalks joyfullywalk
        const collector = Sug.suggestionCollector('joyfullwalk', 3);
        Sug.genCompoundableSuggestions(trie.root, collector.word, Sug.CompoundingMethod.SINGLE_WORD, collector);
        const suggestions = collector.suggestions.map(s => s.word);
        expect(suggestions).to.deep.equal(['joyfulwalks', 'joyfulwalk', 'joyfullywalk']);
        expect(collector.maxCost).to.be.lessThan(300);
    });

    it('Tests the collector with filter', () => {
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        collector({ word: 'joyfully', cost: 100 });
        expect(collector.suggestions).to.be.empty;
    });

    it('Tests the collector with duplicate words of different costs', () => {
        const collector = Sug.suggestionCollector('joyfull', 3, (word) => word !== 'joyfully');
        collector({ word: 'joyful', cost: 100 });
        expect(collector.suggestions.length).to.be.equal(1);
        collector({ word: 'joyful', cost: 75 });
        expect(collector.suggestions.length).to.be.equal(1);
        expect(collector.suggestions[0].cost).to.be.equal(75);
        collector({ word: 'joyfuller', cost: 200 });
        collector({ word: 'joyfullest', cost: 300 });
        collector({ word: 'joyfulness', cost: 340 });
        collector({ word: 'joyful', cost: 85 });
        expect(collector.suggestions.length).to.be.equal(3);
        expect(collector.suggestions[0].cost).to.be.equal(75);
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

