"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const textValidator_1 = require("./textValidator");
const SpellingDictionary_1 = require("./SpellingDictionary");
const SpellingDictionary_2 = require("./SpellingDictionary");
const FreqCounter_1 = require("./util/FreqCounter");
// cSpell:enableCompoundWords
describe('Validate textValidator functions', () => {
    it('tests hasWordCheck', () => {
        // cspell:ignore redgreenblueyellow strawberrymangobanana redwhiteblue
        const dictCol = getSpellingDictionaryCollection();
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'brown', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'white', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'berry', true)).to.be.true;
        // compound words do not cross dictionary boundaries
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'whiteberry', true)).to.be.false;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'redmango', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'strawberrymangobanana', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'lightbrown', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'redgreenblueyellow', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'redwhiteblue', true)).to.be.true;
    });
    it('tests textValidator no word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, {});
        const errors = result.map(wo => wo.text).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });
    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'whiteberry']);
    });
    // cSpell:ignore xxxkxxxx xxxbxxxx
    it('tests ignoring words that consist of a single repeated letter', () => {
        const dictCol = getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = textValidator_1.validateText(text, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray().sort();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'whiteberry', 'xxxbxxxx', 'xxxkxxxx']);
    });
    it('tests trailing s, ed, ing, etc. are attached to the words', () => {
        const dictEmpty = SpellingDictionary_2.createSpellingDictionary([], 'empty', 'test');
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = textValidator_1.validateText(text, dictEmpty, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray();
        chai_1.expect(errors).to.deep.equal(['have', 'Published', 'multiple', 'Fixes', 'Problems']);
    });
    it('tests trailing s, ed, ing, etc.', () => {
        const dictWords = getSpellingDictionaryCollection();
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = textValidator_1.validateText(text, dictWords, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray().sort();
        chai_1.expect(errors).to.deep.equal([]);
    });
    it('test contractions', () => {
        const dictWords = getSpellingDictionaryCollection();
        // cspell:disable
        const text = `We should’ve done a better job, but we couldn\\'t have known.`;
        // cspell:enable
        const result = textValidator_1.validateText(text, dictWords, { allowCompoundWords: false });
        const errors = result.map(wo => wo.text).toArray().sort();
        chai_1.expect(errors).to.deep.equal([]);
    });
    it('tests maxDuplicateProblems', () => {
        const dict = SpellingDictionary_2.createSpellingDictionary([], 'empty', 'test');
        const text = sampleText;
        const result = textValidator_1.validateText(text, dict, { maxNumberOfProblems: 1000, maxDuplicateProblems: 1 });
        const freq = FreqCounter_1.FreqCounter.create(result.map(t => t.text));
        chai_1.expect(freq.total).to.be.equal(freq.counters.size);
        const words = freq.counters.keys();
        const dict2 = SpellingDictionary_2.createSpellingDictionary(words, 'test', 'test');
        const result2 = [...textValidator_1.validateText(text, dict2, { maxNumberOfProblems: 1000, maxDuplicateProblems: 1 })];
        chai_1.expect(result2.length).to.be.equal(0);
    });
    it('tests inclusion, exclusion', () => {
        const result = textValidator_1.calcTextInclusionRanges(sampleText, {});
        chai_1.expect(result.length).to.be.equal(1);
        chai_1.expect(result.map(a => [a.startPos, a.endPos])).to.deep.equal([[0, sampleText.length]]);
    });
    it('tests inclusion, exclusion', () => {
        const result = textValidator_1.calcTextInclusionRanges(sampleText, { ignoreRegExpList: [/The/g] });
        chai_1.expect(result.length).to.be.equal(5);
        chai_1.expect(result.map(a => [a.startPos, a.endPos])).to.deep.equal([
            [0, 5],
            [8, 34],
            [37, 97],
            [100, 142],
            [145, 196],
        ]);
    });
});
function getSpellingDictionaryCollection() {
    const dicts = [
        SpellingDictionary_2.createSpellingDictionary(colors, 'colors', 'test'),
        SpellingDictionary_2.createSpellingDictionary(fruit, 'fruit', 'test'),
        SpellingDictionary_2.createSpellingDictionary(animals, 'animals', 'test'),
        SpellingDictionary_2.createSpellingDictionary(insects, 'insects', 'test'),
        SpellingDictionary_2.createSpellingDictionary(words, 'words', 'test', { repMap: [['’', "'"]] }),
    ];
    return SpellingDictionary_1.createCollection(dicts, 'collection');
}
const colors = ['red', 'green', 'blue', 'black', 'white', 'orange', 'purple', 'yellow', 'gray', 'brown', 'light', 'dark'];
const fruit = [
    'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry', 'berry', 'red'
];
const animals = ['ape', 'lion', 'tiger', 'Elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
const insects = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
const words = [
    'the', 'and', 'is', 'has', 'ate', 'light', 'dark', 'little',
    'big', 'we', 'have', 'published', 'multiple', 'fixes', 'to',
    'the', 'problems', 'better', 'done', 'known',
    "shouldn't", "couldn't", "should've",
];
const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
//# sourceMappingURL=textValidator.test.js.map