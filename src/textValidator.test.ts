import { expect } from 'chai';

import { validateText, hasWordCheck } from './textValidator';
import { createCollection } from './SpellingDictionary';
import { createSpellingDictionary } from './SpellingDictionary';
import { FreqCounter } from './util/FreqCounter';

// cSpell:enableCompoundWords

describe('Validate textValidator functions', () => {
    it('tests hasWordCheck', () => {
        // cspell:ignore redgreenblueyellow strawberrymangobanana redwhiteblue
        const dictCol = getSpellingDictionaryCollection();
        expect(hasWordCheck(dictCol, 'brown', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'white', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'berry', true)).to.be.true;
        // compound words do not cross dictionary boundaries
        expect(hasWordCheck(dictCol, 'whiteberry', true)).to.be.false;
        expect(hasWordCheck(dictCol, 'redmango', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'strawberrymangobanana', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'lightbrown', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'redgreenblueyellow', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'redwhiteblue', true)).to.be.true;
    });

    it('tests textValidator no word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, {});
        const errors = result.map(wo => wo.text).toArray();
        expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });

    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray();
        expect(errors).to.deep.equal(['giraffe', 'whiteberry']);
    });

    // cSpell:ignore xxxkxxxx xxxbxxxx
    it('tests ignoring words that consist of a single repeated letter', () => {
        const dictCol = getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = validateText(text, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray().sort();
        expect(errors).to.deep.equal(['giraffe', 'whiteberry', 'xxxbxxxx', 'xxxkxxxx']);
    });

    it('tests trailing s, ed, ing, etc. are attached to the words', () => {
        const dictEmpty = createSpellingDictionary([], 'empty');
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictEmpty, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray();
        expect(errors).to.deep.equal(['have', 'Published', 'multiple', 'Fixes', 'Problems']);
    });

    it('tests trailing s, ed, ing, etc.', () => {
        const dictWords = getSpellingDictionaryCollection();
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictWords, { allowCompoundWords: true });
        const errors = result.map(wo => wo.text).toArray().sort();
        expect(errors).to.deep.equal([]);
    });

    it('test contractions', () => {
        const dictWords = getSpellingDictionaryCollection();
        // cspell:disable
        const text = `We should’ve done a better job, but we couldn\\'t have known.`;
        // cspell:enable
        const result = validateText(text, dictWords, { allowCompoundWords: false });
        const errors = result.map(wo => wo.text).toArray().sort();
        expect(errors).to.deep.equal([]);
    });

    it('tests maxDuplicateProblems', () => {
        const dict = createSpellingDictionary([], 'empty');
        const text = sampleText;
        const result = validateText(text, dict, { maxNumberOfProblems: 1000, maxDuplicateProblems: 1 });
        const freq = FreqCounter.create(result.map(t => t.text));
        expect(freq.total).to.be.equal(freq.counters.size);
        const words = freq.counters.keys();
        const dict2 = createSpellingDictionary(words, 'test');
        const result2 = [...validateText(text, dict2, { maxNumberOfProblems: 1000, maxDuplicateProblems: 1 })];
        expect(result2.length).to.be.equal(0);
    });
});

function getSpellingDictionaryCollection() {
    const dicts = [
        createSpellingDictionary(colors, 'colors'),
        createSpellingDictionary(fruit, 'fruit'),
        createSpellingDictionary(animals, 'animals'),
        createSpellingDictionary(insects, 'insects'),
        createSpellingDictionary(words, 'words', { repMap: [['’', "'"]]}),
    ];

    return createCollection(dicts, 'collection');
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
