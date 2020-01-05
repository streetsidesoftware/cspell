import {expect} from 'chai';
import {Trie, defaultTrieOptions} from './trie';
import {isWordTerminationNode, orderTrie, normalizeWordToLowercase} from './util';
import {suggestionCollector, CompoundWordsMethod} from './suggest';
import { parseDictionary } from './SimpleDictionaryParser';

describe('Validate Trie Class', () => {
    test('Tests creating a Trie', () => {
        const trie = Trie.create(sampleWords);
        expect(trie).to.be.instanceof(Trie);
    });

    test('Tests getting words from a Trie', () => {
        const trie = Trie.create(sampleWords);
        expect([...trie.words()]).to.be.deep.equal(sampleWords.sort());
    });

    test('Tests seeing if a Trie contains a word', () => {
        const trie = Trie.create(sampleWords);
        expect(trie.has('lift')).to.be.true;
        expect(trie.has('fork-lift')).to.be.false;
    });

    test('Tests complete', () => {
        const trie = Trie.create(sampleWords);
        expect([...trie.completeWord('lift')]).to.be.deep.equal(sampleWords.filter(w => w.slice(0, 4) === 'lift').sort());
        expect([...trie.completeWord('life')]).to.be.deep.equal([]);
        expect([...trie.completeWord('lifting')]).to.be.deep.equal(['lifting']);
    });

    test('Tests insert', () => {
        const trie1 = Trie.create(sampleWords);
        const trie2 = Trie.create([]);
        sampleWords.forEach(word => trie2.insert(word));
        orderTrie(trie2.root);

        const words1 = [...trie1.words()];
        const words2 = [...trie2.words()];
        expect(words2).to.be.deep.equal(words1);
    });

    test('tests suggestions', () => {
        const trie = Trie.create(sampleWords);
        const suggestions = trie.suggest('wall', 10);
        expect(suggestions).to.contain('walk');
    });

    test('tests suggestions with compounds', () => {
        const trie = Trie.create(sampleWords);
        // cspell:ignore joyostalkliftswak
        const suggestions = trie.suggest('joyostalkliftswak', 10, CompoundWordsMethod.SEPARATE_WORDS);
        expect(suggestions).to.contain('joyous talk lifts walk');
    });

    test('tests genSuggestions', () => {
        const trie = Trie.create(sampleWords);
        const collector = suggestionCollector('wall', 10);
        trie.genSuggestions(collector);
        expect(collector.suggestions.map(a => a.word)).to.contain('walk');
    });

    test('Tests iterate', () => {
        const trie = Trie.create(sampleWords);
        const words = [...trie.iterate()]
            .filter(r => isWordTerminationNode(r.node))
            .map(r => r.text);
        expect(words).to.be.deep.equal(sampleWords.sort());
    });

    test('Test where only part of the word is correct', () => {
        const trie = Trie.create(sampleWords);
        expect(trie.has('talking')).to.be.true;
        expect(trie.has('talkings')).to.be.false;
    });

    test('Tests Trie default options', () => {
        const trie = Trie.create(sampleWords);
        expect(trie).to.be.instanceof(Trie);
        const options = trie.options;
        expect(options).to.be.deep.equal(defaultTrieOptions);
    });

    test('Tests Trie options', () => {
        const trie = Trie.create(sampleWords, { forbiddenWordPrefix: '#'});
        expect(trie).to.be.instanceof(Trie);
        const options = trie.options;
        expect(options).to.not.deep.equal(defaultTrieOptions);
        expect(options.forbiddenWordPrefix).to.equal('#');
    });

    test('Test compound words', () => {
        // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
        const trie = Trie.create(sampleWords);
        expect(trie.has('talkinglift', true)).to.be.true;
        expect(trie.has('joywalk', true)).to.be.true;
        expect(trie.has('jaywalk', true)).to.be.true;
        expect(trie.has('jwalk', true)).to.be.false;
        expect(trie.has('awalk', true)).to.be.false;
        expect(trie.has('jayjay', true)).to.be.true;
        expect(trie.has('jayjay', 4)).to.be.false;
        expect(trie.has('jayi', 3)).to.be.false;
        expect(trie.has('toto', true)).to.be.false;
        expect(trie.has('toto', 2)).to.be.true;
        expect(trie.has('toto', 1)).to.be.true;
        expect(trie.has('iif', 1)).to.be.true;
        expect(trie.has('uplift', true)).to.be.false;
        expect(trie.has('endless', true)).to.be.true;
        expect(trie.has('joywalk', false)).to.be.false;
        expect(trie.has('walked', true)).to.be.true;
    });

    test('Test compound find', () => {
        // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
        const trie = Trie.create(sampleWords);
        expect(trie.find('talkinglift', true)?.f).to.be.equal(1);
        expect(trie.find('joywalk', true)?.f).to.be.equal(1);
        expect(trie.find('jaywalk', true)?.f).to.be.equal(1);
        expect(trie.find('jwalk', true)?.f).to.be.undefined;
        expect(trie.find('awalk', true)?.f).to.be.undefined;
        expect(trie.find('jayjay', true)?.f).to.be.equal(1);
        expect(trie.find('jayjay', 4)?.f).to.be.undefined;
        expect(trie.find('jayi', 3)?.f).to.be.undefined;
        expect(trie.find('toto', true)?.f).to.be.undefined;
        expect(trie.find('toto', 2)?.f).to.be.equal(1);
        expect(trie.find('toto', 1)?.f).to.be.equal(1);
        expect(trie.find('iif', 1)?.f).to.be.equal(1);
        expect(trie.find('uplift', true)?.f).to.be.undefined;
        expect(trie.find('endless', true)?.f).to.be.equal(1);
        expect(trie.find('joywalk', false)?.f).to.be.undefined;
        expect(trie.find('walked', true)?.f).to.be.equal(1);
    });

    test('size', () => {
        const trie = Trie.create(sampleWords);
        expect(trie.size()).to.equal(80);
        // Request again to make sure it is the same value twice since the calculation is lazy.
        expect(trie.size()).to.equal(80);
    });

    test('isLegacy', () => {
        const trieLegacy = Trie.create(sampleWords);
        const trieModern = parseDictionary(`
        # Sample Word List
        begin*
        *end
        café
        `);

        expect(trieLegacy.isLegacy).to.be.true;
        expect(trieModern.isLegacy).to.be.false;
    });

    test('hasWord', () => {
        const trie = parseDictionary(`
        # Sample Word List
        Begin*
        *End
        +Middle+
        café
        play*
        *time
        !playtime
        `);

        expect(trie.hasWord('café', true)).to.be.true;
        expect(trie.hasWord('Café', true)).to.be.false;
        expect(trie.hasWord('café', false)).to.be.false;
        expect(trie.hasWord('Café', false)).to.be.false;
        expect(trie.hasWord(normalizeWordToLowercase('café'), false)).to.be.true;
        expect(trie.hasWord(normalizeWordToLowercase('Café'), false)).to.be.true;
        expect(trie.hasWord('BeginMiddleEnd', true)).to.be.true;
        expect(trie.hasWord('BeginMiddleMiddleEnd', true)).to.be.true;
        expect(trie.hasWord('BeginEnd', true)).to.be.true;
        expect(trie.hasWord('MiddleEnd', true)).to.be.false;
        expect(trie.hasWord('beginend', false)).to.be.true; // cspell:disable-line

        // Forbidden word
        expect(trie.hasWord('playtime', true)).to.be.false;
        expect(trie.hasWord('playtime', false)).to.be.false;
        expect(trie.hasWord('playmiddletime', false)).to.be.true; // cspell:disable-line

        // Check parity with has
        expect(trie.has('playtime')).to.be.false;
        expect(trie.has('play+time')).to.be.false;
        expect(trie.has('play')).to.be.true;
        expect(trie.has('play+')).to.be.true;
        expect(trie.has('BeginMiddleEnd')).to.be.true;
    });

    test('find', () => {
        const trie = parseDictionary(`
        # Sample Word List
        Begin*
        *End
        +Middle+
        café
        play*
        *time
        !playtime
        `);

        expect(trie.find('Begin')?.f).to.equal(1);
        expect(trie.find('Begin+')?.f).to.equal(1);
        expect(trie.find('playtime')?.f).to.equal(1);
        expect(trie.find('playtime', true)?.f).to.equal(1);
        expect(trie.find('playtime', 99)?.f).to.be.undefined;
        expect(trie.find('play+time', true)?.f).to.be.equal(1);
        expect(trie.find('play++time', true)?.f).to.be.equal(1);
    });
});

const sampleWords = [
    'a',
    'i',
    'an',
    'as',
    'at',
    'be',
    'bi',
    'by',
    'do',
    'eh',
    'go',
    'he',
    'hi',
    'if',
    'in',
    'is',
    'it',
    'me',
    'my',
    'oh',
    'ok',
    'on',
    'so',
    'to',
    'uh',
    'um',
    'up',
    'us',
    'we',
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
    'less',
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
