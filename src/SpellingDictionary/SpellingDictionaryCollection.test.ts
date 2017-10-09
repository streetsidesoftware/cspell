import { expect } from 'chai';
import * as Trie from 'cspell-trie';
import { SpellingDictionaryCollection, createCollectionP, createCollection } from './SpellingDictionaryCollection';
import { createSpellingDictionary, createSpellingDictionaryRx, SpellingDictionaryFromTrie, CompoundWordsMethod } from './SpellingDictionary';
import * as Rx from 'rxjs/Rx';

describe('Verify using multiple dictionaries', () => {
    const wordsA = ['', 'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    it('checks for existence', () => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ];

        const dictCollection = new SpellingDictionaryCollection(dicts, 'test', ['Avocado']);
        expect(dictCollection.has('mango')).to.be.true;
        expect(dictCollection.has('tree')).to.be.false;
        expect(dictCollection.has('avocado')).to.be.false;
        expect(dictCollection.has('')).to.be.false;
        expect(dictCollection.size).to.be.equal(wordsA.length - 1 + wordsB.length + wordsC.length);
    });

    it('checks for suggestions', () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = [
            trie,
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ];

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).to.be.not.empty;
        expect(sugsForTango[0].word).to.be.equal('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
    });

    it('checks for compound suggestions', () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        trie.options.useCompounds = true;
        const dicts = [
            trie,
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ];

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS);
        const sugs = sugResult.map(a => a.word);
        expect(sugs).to.be.not.empty;
        expect(sugs).to.contain('apple+mango');
        expect(sugs).to.contain('apple mango');
    });

    it('checks for compound suggestions', () => {
        const trie = new SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = [
            trie,
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ];

        // cspell:ignore appletango applemango
        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, CompoundWordsMethod.SEPARATE_WORDS);
        const sugs = sugResult.map(a => a.word);
        expect(sugs).to.be.not.empty;
        expect(sugs).to.not.contain('apple+mango');
        expect(sugs).to.contain('apple mango');
    });

    it('checks for suggestions with flagged words', () => {
        const dicts = [
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsA, 'wordsA'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ];

        const dictCollection = createCollection(dicts, 'test', ['Avocado']);
        const sugs = dictCollection.suggest('avocado', 10);
        expect(sugs.map(r => r.word)).to.be.not.contain('avocado');
    });

    it('checks for suggestions from mixed sources', () => {
        return Promise.all([
            createSpellingDictionaryRx(Rx.Observable.from(wordsA), 'wordsA'),
            createSpellingDictionary(wordsB, 'wordsB'),
            createSpellingDictionary(wordsC, 'wordsC'),
        ])
        .then(dicts => {
            const dictCollection = new SpellingDictionaryCollection(dicts, 'test', []);
            expect(dictCollection.has('mango'));
            expect(dictCollection.has('lion'));
            expect(dictCollection.has('ant'));

            const sugsForTango = dictCollection.suggest('tango', 10);
            expect(sugsForTango).to.be.not.empty;
            expect(sugsForTango[0].word).to.be.equal('mango');
            // make sure there is only one mango suggestion.
            expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);

            // cspell:ignore cellipede
            const sugsForCellipede = dictCollection.suggest('cellipede', 5);
            expect(sugsForCellipede).to.not.be.empty;
            expect(sugsForCellipede.map(s => s.word)).to.contain('centipede');
            expect(sugsForCellipede.map(s => s.word)).to.contain('millipede');
        });
    });

    it('creates using createCollectionP', () => {
        const dicts = [
            Promise.resolve(createSpellingDictionary(wordsA, 'wordsA')),
            Promise.resolve(createSpellingDictionary(wordsB, 'wordsB')),
            Promise.resolve(createSpellingDictionary(wordsC, 'wordsC')),
        ];

        return createCollectionP(dicts, 'test', []).then(dictCollection => {
            expect(dictCollection.has('mango')).to.be.true;
            expect(dictCollection.has('tree')).to.be.false;
            const sugs = dictCollection.suggest('mangos', 4);
            const sugWords = sugs.map(s => s.word);
            expect(sugWords[0]).to.be.equal('mango');
        });
    });

});

