"use strict";
const chai_1 = require("chai");
const textValidator_1 = require("./textValidator");
const SpellingDictionaryCollection_1 = require("./SpellingDictionaryCollection");
const SpellingDictionary_1 = require("./SpellingDictionary");
// cSpell:enableCompoundWords
describe('Validate textValidator functions', () => {
    const cwd = process.cwd();
    // cSpell:disable
    it('tests splitting words', () => {
        const results = [...textValidator_1.wordSplitter('appleorange')];
        chai_1.expect(results).to.deep.equal([
            ['app', 'leorange'],
            ['appl', 'eorange'],
            ['apple', 'orange'],
            ['appleo', 'range'],
            ['appleor', 'ange'],
            ['appleora', 'nge'],
        ]);
    });
    // cSpell:enable
    it('tests trying to split words that are too small', () => {
        chai_1.expect([...textValidator_1.wordSplitter('')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('a')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('ap')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('app')]).to.be.deep.equal([]);
        // cSpell:disable
        chai_1.expect([...textValidator_1.wordSplitter('appl')]).to.be.deep.equal([]);
        // cSpell:enable
        chai_1.expect([...textValidator_1.wordSplitter('apple')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('apples')]).to.be.deep.equal([
            ['app', 'les']
        ]);
    });
    it('tests hasWordCheck', () => {
        const dictCol = getSpellingDictionaryCollection();
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'brown', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'white', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'berry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'whiteberry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'redberry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'lightbrown', true)).to.be.true;
    });
    it('tests textValidator no word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, {});
        const errors = result.map(wo => wo.word).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });
    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe']);
    });
    // cSpell:ignore xxxkxxxx xxxbxxxx
    it('tests ignoring words that consist of a single repeated letter', () => {
        const dictCol = getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = textValidator_1.validateText(text, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray().sort();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'xxxbxxxx', 'xxxkxxxx']);
    });
    it('tests trailing s, ed, ing, etc. are attached to the words', () => {
        const dictEmpty = SpellingDictionary_1.createSpellingDictionary([]);
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = textValidator_1.validateText(text, dictEmpty, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray();
        chai_1.expect(errors).to.deep.equal(['have', 'Published', 'multiple', 'Fixes', 'Problems']);
    });
    it('tests trailing s, ed, ing, etc.', () => {
        const dictWords = getSpellingDictionaryCollection();
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = textValidator_1.validateText(text, dictWords, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray().sort();
        chai_1.expect(errors).to.deep.equal([]);
    });
});
function getSpellingDictionaryCollection() {
    const dicts = [
        SpellingDictionary_1.createSpellingDictionary(colors),
        SpellingDictionary_1.createSpellingDictionary(fruit),
        SpellingDictionary_1.createSpellingDictionary(animals),
        SpellingDictionary_1.createSpellingDictionary(insects),
        SpellingDictionary_1.createSpellingDictionary(words),
    ];
    return new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts);
}
const colors = ['red', 'green', 'blue', 'black', 'white', 'orange', 'purple', 'yellow', 'gray', 'brown'];
const fruit = [
    'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry', 'berry'
];
const animals = ['ape', 'lion', 'tiger', 'Elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
const insects = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
const words = ['the', 'and', 'is', 'has', 'ate', 'light', 'dark', 'little', 'big', 'we', 'have', 'published', 'multiple', 'fixes', 'to', 'the', 'problems'];
const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
//# sourceMappingURL=textValidator.test.js.map