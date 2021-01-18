import { validateText, hasWordCheck, calcTextInclusionRanges, _testMethods, CheckOptions } from './textValidator';
import { createCollection } from './SpellingDictionary';
import { createSpellingDictionary } from './SpellingDictionary/createSpellingDictionary';
import { FreqCounter } from './util/FreqCounter';
import * as Text from './util/text';
import { genSequence } from 'gensequence';

// cspell:ignore whiteberry redmango lightbrown redberry

describe('Validate textValidator functions', () => {
    test('tests hasWordCheck', async () => {
        // cspell:ignore redgreenblueyellow strawberrymangobanana redwhiteblue
        const dictCol = await getSpellingDictionaryCollection();
        const opt: CheckOptions = {
            allowCompoundWords: true,
            ignoreCase: true,
            caseSensitive: dictCol.isDictionaryCaseSensitive,
        };
        expect(hasWordCheck(dictCol, 'brown', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'white', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'berry', opt)).toBe(true);
        // compound words do not cross dictionary boundaries
        expect(hasWordCheck(dictCol, 'whiteberry', opt)).toBe(false);
        expect(hasWordCheck(dictCol, 'redmango', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'strawberrymangobanana', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'lightbrown', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'redgreenblueyellow', opt)).toBe(true);
        expect(hasWordCheck(dictCol, 'redwhiteblue', opt)).toBe(true);
    });

    test('tests textValidator no word compounds', async () => {
        const dictCol = await getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, {});
        const errors = result.map((wo) => wo.text).toArray();
        expect(errors).toEqual(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });

    test('tests textValidator with word compounds', async () => {
        const dictCol = await getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map((wo) => wo.text).toArray();
        expect(errors).toEqual(['giraffe', 'whiteberry']);
    });

    // cSpell:ignore xxxkxxxx xxxbxxxx
    test('tests ignoring words that consist of a single repeated letter', async () => {
        const dictCol = await getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = validateText(text, dictCol, { allowCompoundWords: true });
        const errors = result
            .map((wo) => wo.text)
            .toArray()
            .sort();
        expect(errors).toEqual(['giraffe', 'whiteberry', 'xxxbxxxx', 'xxxkxxxx']);
    });

    test('tests trailing s, ed, ing, etc. are attached to the words', async () => {
        const dictEmpty = await createSpellingDictionary([], 'empty', 'test');
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictEmpty, {}).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'PUBLISHed', 'multiple', 'FIXes', 'PROBLEMs']);
    });

    test('tests case in ignore words', async () => {
        const dictEmpty = await createSpellingDictionary([], 'empty', 'test');
        const text = 'We have PUBLISHed published multiple FIXesToThePROBLEMs';
        const options = { caseSensitive: true, ignoreWords: ['PUBLISHed', 'FIXesToThePROBLEMs'] };
        const result = validateText(text, dictEmpty, options).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'published', 'multiple']);
    });

    test('tests case sensitive word list', async () => {
        const wordList = ['PUBLISHed', 'FIXesToThePROBLEMs', 'multiple', 'VeryBadProblem', 'with'].concat(
            ['define', '_ERROR_CODE_42', 'NETWORK', '_ERROR42'],
            specialWords
        );
        const flagWords = ['VeryBadProblem'];
        const dict = createSpellingDictionary(wordList, 'empty', 'test', {
            caseSensitive: true,
        });
        const text = `
            We have PUBLISHed published Multiple FIXesToThePROBLEMs.
            VeryBadProblem with the 4wheel of the Range8 in Amsterdam, Berlin, and paris.
            #define _ERROR_CODE_42 = NETWORK_ERROR42
        `;
        const options = { allowCompoundWords: false, ignoreCase: false, flagWords };
        const result = validateText(text, dict, options).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'published', 'VeryBadProblem', 'paris']);
    });

    test('tests trailing s, ed, ing, etc.', async () => {
        const dictWords = await getSpellingDictionaryCollection();
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictWords, { allowCompoundWords: true });
        const errors = result
            .map((wo) => wo.text)
            .toArray()
            .sort();
        expect(errors).toEqual([]);
    });

    test('contractions', async () => {
        const dictWords = await getSpellingDictionaryCollection();
        // cspell:disable
        const text = `We should’ve done a better job, but we couldn\\'t have known.`;
        // cspell:enable
        const result = validateText(text, dictWords, { allowCompoundWords: false });
        const errors = result
            .map((wo) => wo.text)
            .toArray()
            .sort();
        expect(errors).toEqual([]);
    });

    test('tests maxDuplicateProblems', async () => {
        const dict = await createSpellingDictionary([], 'empty', 'test');
        const text = sampleText;
        const result = validateText(text, dict, {
            maxNumberOfProblems: 1000,
            maxDuplicateProblems: 1,
        });
        const freq = FreqCounter.create(result.map((t) => t.text));
        expect(freq.total).toBe(freq.counters.size);
        const words = freq.counters.keys();
        const dict2 = await createSpellingDictionary(words, 'test', 'test');
        const result2 = [...validateText(text, dict2, { maxNumberOfProblems: 1000, maxDuplicateProblems: 1 })];
        expect(result2.length).toBe(0);
    });

    test('tests inclusion, no exclusions', () => {
        const result = calcTextInclusionRanges(sampleText, {});
        expect(result.length).toBe(1);
        expect(result.map((a) => [a.startPos, a.endPos])).toEqual([[0, sampleText.length]]);
    });

    test('tests inclusion, exclusion', () => {
        const result = calcTextInclusionRanges(sampleText, { ignoreRegExpList: [/The/g] });
        expect(result.length).toBe(5);
        expect(result.map((a) => [a.startPos, a.endPos])).toEqual([
            [0, 5],
            [8, 34],
            [37, 97],
            [100, 142],
            [145, 196],
        ]);
    });

    test('tests words crossing exclude boundaries', async () => {
        const text = '_Test the _line_breaks___from __begin to end__ _eol_';
        const inclusionRanges = calcTextInclusionRanges(text, { ignoreRegExpList: [/_/g] });
        const mapper = _testMethods.mapWordsAgainstRanges(inclusionRanges);
        const results = Text.matchStringToTextOffset(/\w+/g, text).concatMap(mapper).toArray();
        const words = results.map((r) => r.text);
        expect(words.join(' ')).toBe('Test the line breaks from begin to end eol');
    });

    test('tests words crossing exclude boundaries out of order', async () => {
        const text = '_Test the _line_breaks___from __begin to end__ _eol_';
        const inclusionRanges = calcTextInclusionRanges(text, { ignoreRegExpList: [/_/g] });
        const mapper = _testMethods.mapWordsAgainstRanges(inclusionRanges);
        // sort the texts by the word so it is out of order.
        const texts = [...Text.matchStringToTextOffset(/\w+/g, text)].sort((a, b) =>
            a.text < b.text ? -1 : a.text > b.text ? 1 : 0
        );
        const results = genSequence(texts).concatMap(mapper).toArray();
        const words = results.sort((a, b) => a.offset - b.offset).map((r) => r.text);
        expect(words.join(' ')).toBe('Test the line breaks from begin to end eol');
    });
});

async function getSpellingDictionaryCollection() {
    const dicts = await Promise.all([
        createSpellingDictionary(colors, 'colors', 'test'),
        createSpellingDictionary(fruit, 'fruit', 'test'),
        createSpellingDictionary(animals, 'animals', 'test'),
        createSpellingDictionary(insects, 'insects', 'test'),
        createSpellingDictionary(words, 'words', 'test', { repMap: [['’', "'"]] }),
    ]);

    return createCollection(dicts, 'collection');
}

const colors = [
    'red',
    'green',
    'blue',
    'black',
    'white',
    'orange',
    'purple',
    'yellow',
    'gray',
    'brown',
    'light',
    'dark',
];
const fruit = [
    'apple',
    'banana',
    'orange',
    'pear',
    'pineapple',
    'mango',
    'avocado',
    'grape',
    'strawberry',
    'blueberry',
    'blackberry',
    'berry',
    'red',
];
const animals = ['ape', 'lion', 'tiger', 'Elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
const insects = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
const words = [
    'the',
    'and',
    'is',
    'has',
    'ate',
    'light',
    'dark',
    'little',
    'big',
    'we',
    'have',
    'published',
    'multiple',
    'fixes',
    'to',
    'the',
    'problems',
    'better',
    'done',
    'known',
    "shouldn't",
    "couldn't",
    "should've",
];

const specialWords = ['Range8', '4wheel', 'db2Admin', 'Amsterdam', 'Berlin', 'Paris'];

const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
