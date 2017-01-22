"use strict";
const chai_1 = require("chai");
const SpellingDictionaryCollection_1 = require("./SpellingDictionaryCollection");
const SpellingDictionary_1 = require("./SpellingDictionary");
const Rx = require("rxjs/Rx");
describe('Verify using multiple dictionaries', () => {
    const wordsA = ['apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    it('checks for existence', () => {
        const dicts = [
            SpellingDictionary_1.createSpellingDictionary(wordsA),
            SpellingDictionary_1.createSpellingDictionary(wordsB),
            SpellingDictionary_1.createSpellingDictionary(wordsC),
        ];
        const dictCollection = new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts);
        chai_1.expect(dictCollection.has('mango')).to.be.true;
        chai_1.expect(dictCollection.has('tree')).to.be.false;
    });
    it('checks for suggestions', () => {
        const dicts = [
            SpellingDictionary_1.createSpellingDictionary(wordsA),
            SpellingDictionary_1.createSpellingDictionary(wordsB),
            SpellingDictionary_1.createSpellingDictionary(wordsA),
            SpellingDictionary_1.createSpellingDictionary(wordsC),
        ];
        const dictCollection = new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts);
        const sugsForTango = dictCollection.suggest('tango', 10);
        chai_1.expect(sugsForTango).to.be.not.empty;
        chai_1.expect(sugsForTango[0].word).to.be.equal('mango');
        // make sure there is only one mango suggestion.
        chai_1.expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
    });
    it('checks for suggestions from mixed sources', () => {
        return Promise.all([
            SpellingDictionary_1.createSpellingDictionaryRx(Rx.Observable.from(wordsA)),
            SpellingDictionary_1.createSpellingDictionary(wordsB),
            SpellingDictionary_1.createSpellingDictionary(wordsC),
        ])
            .then(dicts => {
            const dictCollection = new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts);
            chai_1.expect(dictCollection.has('mango'));
            chai_1.expect(dictCollection.has('lion'));
            chai_1.expect(dictCollection.has('ant'));
            const sugsForTango = dictCollection.suggest('tango', 10);
            chai_1.expect(sugsForTango).to.be.not.empty;
            chai_1.expect(sugsForTango[0].word).to.be.equal('mango');
            // make sure there is only one mango suggestion.
            chai_1.expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
        });
    });
});
//# sourceMappingURL=SpellingDictionaryCollection.test.js.map