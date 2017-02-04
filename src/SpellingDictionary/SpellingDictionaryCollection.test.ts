import { expect } from 'chai';
import { SpellingDictionaryCollection, createCollectionP, createCollection } from './SpellingDictionaryCollection';
import { createSpellingDictionary, createSpellingDictionaryRx } from './SpellingDictionary';
import * as Rx from 'rxjs/Rx';

describe('Verify using multiple dictionaries', () => {
    const wordsA = ['apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    it('checks for existence', () => {
        const dicts = [
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsC),
        ];

        const dictCollection = new SpellingDictionaryCollection(dicts);
        expect(dictCollection.has('mango')).to.be.true;
        expect(dictCollection.has('tree')).to.be.false;
        expect(dictCollection.size).to.be.equal(wordsA.length + wordsB.length + wordsC.length);
    });

    it('checks for suggestions', () => {
        const dicts = [
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsC),
        ];

        const dictCollection = createCollection(dicts);
        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).to.be.not.empty;
        expect(sugsForTango[0].word).to.be.equal('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
    });


    it('checks for suggestions from mixed sources', () => {
        return Promise.all([
            createSpellingDictionaryRx(Rx.Observable.from(wordsA)),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsC),
        ])
        .then(dicts => {
            const dictCollection = new SpellingDictionaryCollection(dicts);
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
            Promise.resolve(createSpellingDictionary(wordsA)),
            Promise.resolve(createSpellingDictionary(wordsB)),
            Promise.resolve(createSpellingDictionary(wordsC)),
        ];

        return createCollectionP(dicts).then(dictCollection => {
            expect(dictCollection.has('mango')).to.be.true;
            expect(dictCollection.has('tree')).to.be.false;
            const sugs = dictCollection.suggest('mangos', 4);
            const sugWords = sugs.map(s => s.word);
            expect(sugWords[0]).to.be.equal('mango');
        });
    });

});

