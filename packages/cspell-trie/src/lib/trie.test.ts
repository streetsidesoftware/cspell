import {expect} from 'chai';
import {Trie} from './trie';
import {isWordTerminationNode, orderTrie} from './util';
import {suggestionCollector, CompoundWordsMethod} from './suggest';

describe('Validate Trie Class', () => {
    it('Tests creating a Trie', () => {
        const trie = Trie.create(sampleWords);
        expect(trie).to.be.instanceof(Trie);
    });

    it('Tests getting words from a Trie', () => {
        const trie = Trie.create(sampleWords);
        expect([...trie.words()]).to.be.deep.equal(sampleWords.sort());
    });

    it('Tests seeing if a Trie contains a word', () => {
        const trie = Trie.create(sampleWords);
        expect(trie.has('lift')).to.be.true;
        expect(trie.has('fork-lift')).to.be.false;
    });

    it('Tests complete', () => {
        const trie = Trie.create(sampleWords);
        expect([...trie.completeWord('lift')]).to.be.deep.equal(sampleWords.filter(w => w.slice(0, 4) === 'lift').sort());
        expect([...trie.completeWord('life')]).to.be.deep.equal([]);
        expect([...trie.completeWord('lifting')]).to.be.deep.equal(['lifting']);
    });

    it('Tests insert', () => {
        const trie1 = Trie.create(sampleWords);
        const trie2 = Trie.create([]);
        sampleWords.forEach(word => trie2.insert(word));
        orderTrie(trie2.root);

        const words1 = [...trie1.words()];
        const words2 = [...trie2.words()];
        expect(words2).to.be.deep.equal(words1);
    });

    it('tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const suggestions = trie.suggest('wall', 10);
        expect(suggestions).to.contain('walk');
    });

    it('tests suggestions with compounds', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyostalkliftswak
        const suggestions = trie.suggest('joyostalkliftswak', 10, CompoundWordsMethod.SEPARATE_WORDS);
        expect(suggestions).to.contain('joyous talk lifts walk');
    });

    it('tests genSuggestions', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wall', 10);
        trie.genSuggestions(collector);
        expect(collector.suggestions.map(a => a.word)).to.contain('walk');
    });

    it('Tests iterate', () => {
        const trie = Trie.create(sampleWords);
        const words = [...trie.iterate()]
            .filter(r => isWordTerminationNode(r.node))
            .map(r => r.text);
        expect(words).to.be.deep.equal(sampleWords.sort());
    });

    it('Test where only part of the word is correct', () => {
        const trie = Trie.create(sampleWords);
        expect(trie.has('talking')).to.be.true;
        expect(trie.has('talkings')).to.be.false;
    });

    it('Test compound words', () => {
        // cspell:ignore talkinglift joywalk jwalk
        const trie = Trie.create(sampleWords);
        expect(trie.has('talkinglift', true)).to.be.true;
        expect(trie.has('joywalk', true)).to.be.true;
        expect(trie.has('jaywalk', true)).to.be.true;
        expect(trie.has('jwalk', true)).to.be.false;
        expect(trie.has('joywalk', false)).to.be.false;
        expect(trie.has('walked', true)).to.be.true;
    });
});

const sampleWords = [
    'edit',
    'end',
    'edge',
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
    'jay',
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

