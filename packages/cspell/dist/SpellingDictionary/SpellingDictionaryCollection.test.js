"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Trie = require("cspell-trie");
const SpellingDictionaryCollection_1 = require("./SpellingDictionaryCollection");
const SpellingDictionary_1 = require("./SpellingDictionary");
const rxjs_1 = require("rxjs");
describe('Verify using multiple dictionaries', () => {
    const wordsA = ['', 'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    it('checks for existence', () => {
        const dicts = [
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];
        const dictCollection = new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts, 'test', ['Avocado']);
        chai_1.expect(dictCollection.has('mango')).to.be.true;
        chai_1.expect(dictCollection.has('tree')).to.be.false;
        chai_1.expect(dictCollection.has('avocado')).to.be.false;
        chai_1.expect(dictCollection.has('')).to.be.false;
        chai_1.expect(dictCollection.size).to.be.equal(wordsA.length - 1 + wordsB.length + wordsC.length);
    });
    it('checks for suggestions', () => {
        const trie = new SpellingDictionary_1.SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = [
            trie,
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];
        const dictCollection = SpellingDictionaryCollection_1.createCollection(dicts, 'test', ['Avocado']);
        const sugsForTango = dictCollection.suggest('tango', 10);
        chai_1.expect(sugsForTango).to.be.not.empty;
        chai_1.expect(sugsForTango[0].word).to.be.equal('mango');
        // make sure there is only one mango suggestion.
        chai_1.expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
    });
    it('checks for compound suggestions', () => {
        // Add "wordsA" twice, once as a compound dictionary and once as a normal dictionary.
        const trie = new SpellingDictionary_1.SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        trie.options.useCompounds = true;
        const dicts = [
            trie,
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];
        // cspell:ignore appletango applemango
        const dictCollection = SpellingDictionaryCollection_1.createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, SpellingDictionary_1.CompoundWordsMethod.SEPARATE_WORDS);
        const sugs = sugResult.map(a => a.word);
        chai_1.expect(sugs).to.be.not.empty;
        chai_1.expect(sugs).to.contain('apple+mango');
        chai_1.expect(sugs).to.contain('apple mango');
    });
    it('checks for compound suggestions', () => {
        const trie = new SpellingDictionary_1.SpellingDictionaryFromTrie(Trie.Trie.create(wordsA), 'wordsA');
        const dicts = [
            trie,
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];
        // cspell:ignore appletango applemango
        const dictCollection = SpellingDictionaryCollection_1.createCollection(dicts, 'test', ['Avocado']);
        const sugResult = dictCollection.suggest('appletango', 10, SpellingDictionary_1.CompoundWordsMethod.SEPARATE_WORDS, 2);
        const sugs = sugResult.map(a => a.word);
        chai_1.expect(sugs).to.be.not.empty;
        chai_1.expect(sugs).to.not.contain('apple+mango');
        chai_1.expect(sugs).to.contain('apple mango');
    });
    it('checks for suggestions with flagged words', () => {
        const dicts = [
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ];
        const dictCollection = SpellingDictionaryCollection_1.createCollection(dicts, 'test', ['Avocado']);
        const sugs = dictCollection.suggest('avocado', 10);
        chai_1.expect(sugs.map(r => r.word)).to.be.not.contain('avocado');
    });
    it('checks for suggestions from mixed sources', () => {
        return Promise.all([
            SpellingDictionary_1.createSpellingDictionaryRx(rxjs_1.from(wordsA), 'wordsA', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test'),
            SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test'),
        ])
            .then(dicts => {
            const dictCollection = new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts, 'test', []);
            chai_1.expect(dictCollection.has('mango'));
            chai_1.expect(dictCollection.has('lion'));
            chai_1.expect(dictCollection.has('ant'));
            const sugsForTango = dictCollection.suggest('tango', 10);
            chai_1.expect(sugsForTango).to.be.not.empty;
            chai_1.expect(sugsForTango[0].word).to.be.equal('mango');
            // make sure there is only one mango suggestion.
            chai_1.expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
            // cspell:ignore cellipede
            const sugsForCellipede = dictCollection.suggest('cellipede', 5);
            chai_1.expect(sugsForCellipede).to.not.be.empty;
            chai_1.expect(sugsForCellipede.map(s => s.word)).to.contain('centipede');
            chai_1.expect(sugsForCellipede.map(s => s.word)).to.contain('millipede');
        });
    });
    it('creates using createCollectionP', () => {
        const dicts = [
            Promise.resolve(SpellingDictionary_1.createSpellingDictionary(wordsA, 'wordsA', 'test')),
            Promise.resolve(SpellingDictionary_1.createSpellingDictionary(wordsB, 'wordsB', 'test')),
            Promise.resolve(SpellingDictionary_1.createSpellingDictionary(wordsC, 'wordsC', 'test')),
        ];
        return SpellingDictionaryCollection_1.createCollectionP(dicts, 'test', []).then(dictCollection => {
            chai_1.expect(dictCollection.has('mango')).to.be.true;
            chai_1.expect(dictCollection.has('tree')).to.be.false;
            const sugs = dictCollection.suggest('mangos', 4);
            const sugWords = sugs.map(s => s.word);
            chai_1.expect(sugWords[0]).to.be.equal('mango');
        });
    });
});
//# sourceMappingURL=SpellingDictionaryCollection.test.js.map