import {expect} from 'chai';
import * as Sug from './suggest';
import {Trie} from './trie';

describe('Validate Suggest', () => {
    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const results = Sug.suggest(trie.root, 'talks');
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[0]).to.be.equal('talks');
        expect(suggestions[1]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talks', 'talk', 'walks', 'talked', 'talker', 'walk']);
        // console.log(JSON.stringify(results));
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore tallk
        const results = Sug.suggest(trie.root, 'tallk');
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.contain('talks');
        expect(suggestions).to.contain('talk');
        expect(suggestions[1]).to.be.equal('talks');
        expect(suggestions[0]).to.be.equal('talk');
        expect(suggestions).to.deep.equal(['talk', 'talks', 'walk']);
        console.log(JSON.stringify(results));
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore jernals
        const results = Sug.suggest(trie.root, 'jernals');
        console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal(['journals', 'journal']);
    });

    it('Tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyfull
        const results = Sug.suggest(trie.root, 'joyfull');
        console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.deep.equal(['journals', 'journal']);
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

