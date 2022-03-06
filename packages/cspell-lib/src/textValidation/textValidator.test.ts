import { opConcatMap, pipeSync } from '@cspell/cspell-pipe';
import { genSequence } from 'gensequence';
import { createCSpellSettingsInternal as csi } from '../Models/CSpellSettingsInternalDef';
import { createCollection, getDictionaryInternal, SpellingDictionaryOptions } from '../SpellingDictionary';
import { createSpellingDictionary } from '../SpellingDictionary/createSpellingDictionary';
import { FreqCounter } from '../util/FreqCounter';
import * as Text from '../util/text';
import { settingsToValidateOptions as sToV } from './validator';
import {
    calcTextInclusionRanges,
    hasWordCheck,
    HasWordOptions,
    validateText,
    ValidationOptions,
    _testMethods,
} from './textValidator';

// cspell:ignore whiteberry redmango lightbrown redberry

describe('Validate textValidator functions', () => {
    test('tests hasWordCheck', async () => {
        // cspell:ignore redgreenblueyellow strawberrymangobanana redwhiteblue
        const dictCol = await getSpellingDictionaryCollection();
        const opt: HasWordOptions = {
            useCompounds: true,
            ignoreCase: true,
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
        const result = validateText(sampleText, dictCol, sToV({}));
        const errors = result.map((wo) => wo.text).toArray();
        expect(errors).toEqual(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });

    test('tests textValidator with word compounds', async () => {
        const dictCol = await getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, sToV({ allowCompoundWords: true }));
        const errors = result.map((wo) => wo.text).toArray();
        expect(errors).toEqual(['giraffe', 'whiteberry']);
    });

    // cSpell:ignore xxxkxxxx xxxbxxxx
    test('tests ignoring words that consist of a single repeated letter', async () => {
        const dictCol = await getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = validateText(text, dictCol, sToV({ allowCompoundWords: true }));
        const errors = result
            .map((wo) => wo.text)
            .toArray()
            .sort();
        expect(errors).toEqual(['giraffe', 'whiteberry', 'xxxbxxxx', 'xxxkxxxx']);
    });

    test('tests trailing s, ed, ing, etc. are attached to the words', async () => {
        const dictEmpty = await createSpellingDictionary([], 'empty', 'test', opts());
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictEmpty, sToV({})).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'PUBLISHed', 'multiple', 'FIXes', 'PROBLEMs']);
    });

    test('tests case in ignore words', async () => {
        const dict = await getDictionaryInternal(
            csi({
                words: ['=Sample', 'with', 'Issues'],
                ignoreWords: ['PUBLISHed', 'FIXesToThePROBLEMs'], // cspell:ignore fixestotheproblems
            })
        );
        const text =
            'We have PUBLISHed published multiple FIXesToThePROBLEMs with Sample fixestotheproblems and issues.';
        const options: ValidationOptions = {
            ignoreCase: false,
        };
        const result = validateText(text, dict, options).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'published', 'multiple', 'fixestotheproblems', 'issues']);
    });

    test('tests case in ignore words ignore case', async () => {
        const dict = await getDictionaryInternal(
            csi({
                words: ['=Sample', 'with', 'Issues'],
                ignoreWords: ['"PUBLISHed"', 'FIXesToThePROBLEMs'], // cspell:ignore fixestotheproblems
            })
        );
        const text =
            'We have PUBLISHed published multiple FIXesToThePROBLEMs with Sample fixestotheproblems and issues.';
        const options: ValidationOptions = {
            ignoreCase: true,
        };
        const result = validateText(text, dict, options).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'published', 'multiple']);
    });

    test('tests case sensitive word list', async () => {
        const wordList = ['PUBLISHed', 'FIXesToThePROBLEMs', 'multiple', 'VeryBadProblem', 'with'].concat(
            ['define', '_ERROR_CODE_42', 'NETWORK', '_ERROR42'],
            specialWords
        );
        const flagWords = ['VeryBadProblem'];
        const dict = createSpellingDictionary(
            wordList,
            'empty',
            'test',
            opts({
                caseSensitive: true,
            })
        );
        const text = `
            We have PUBLISHed published Multiple FIXesToThePROBLEMs.
            VeryBadProblem with the 4wheel of the Range8 in Amsterdam, Berlin, and paris.
            #define _ERROR_CODE_42 = NETWORK_ERROR42
        `;
        const options: ValidationOptions = {
            allowCompoundWords: false,
            ignoreCase: false,
            flagWords,
        };
        const result = validateText(text, dict, options).toArray();
        const errors = result.map((wo) => wo.text);
        expect(errors).toEqual(['have', 'published', 'VeryBadProblem', 'paris']);
    });

    test('tests trailing s, ed, ing, etc.', async () => {
        const dictWords = await getSpellingDictionaryCollection();
        const text = 'We have PUBLISHed multiple FIXesToThePROBLEMs';
        const result = validateText(text, dictWords, sToV({ allowCompoundWords: true }));
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
        const result = validateText(text, dictWords, sToV({ allowCompoundWords: false }));
        const errors = result
            .map((wo) => wo.text)
            .toArray()
            .sort();
        expect(errors).toEqual([]);
    });

    test('tests maxDuplicateProblems', async () => {
        const dict = await createSpellingDictionary([], 'empty', 'test', opts());
        const text = sampleText;
        const result = validateText(
            text,
            dict,
            sToV({
                maxNumberOfProblems: 1000,
                maxDuplicateProblems: 1,
            })
        );
        const freq = FreqCounter.create(result.map((t) => t.text));
        expect(freq.total).toBe(freq.counters.size);
        const words = freq.counters.keys();
        const dict2 = await createSpellingDictionary(words, 'test', 'test', opts());
        const result2 = [...validateText(text, dict2, sToV({ maxNumberOfProblems: 1000, maxDuplicateProblems: 1 }))];
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
        const results = [...pipeSync(Text.matchStringToTextOffset(/\w+/g, text), opConcatMap(mapper))];
        const words = results.map((r) => r.text);
        expect(words.join(' ')).toBe('Test the line breaks from begin to end eol');
    });

    test('make sure maxDuplicateProblems is honored', () => {
        const dictWords = getSpellingDictionaryCollectionSync();
        // cspell:ignore unword
        const text = 'unword '.repeat(20);

        const resultDef = [...validateText(text, dictWords, sToV({}))];
        expect(resultDef).toHaveLength(5);

        const result10 = [
            ...validateText(text, dictWords, sToV({ allowCompoundWords: false, maxDuplicateProblems: 10 })),
        ];
        expect(result10).toHaveLength(10);
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

    test.each`
        text                            | ignoreWords   | flagWords        | expected
        ${'red'}                        | ${[]}         | ${undefined}     | ${[]}
        ${'color'}                      | ${[]}         | ${undefined}     | ${[ov({ text: 'color', isFound: false })]}
        ${'colour'}                     | ${[]}         | ${undefined}     | ${[ov({ text: 'colour', isFlagged: true })]}
        ${'colour'}                     | ${['colour']} | ${undefined}     | ${[]}
        ${'The ant ate the antelope.'}  | ${[]}         | ${['fbd']}       | ${[]}
        ${'The ant ate the antelope.'}  | ${[]}         | ${['ate']}       | ${[ov({ text: 'ate', isFlagged: true })]}
        ${'theANT_ateThe_antelope.'}    | ${[]}         | ${['ate']}       | ${[ov({ text: 'ate', isFlagged: true })]}
        ${'The ant ate the antelope.'}  | ${[]}         | ${['antelope']}  | ${[ov({ text: 'antelope', isFlagged: true })]}
        ${'This should be ok'}          | ${[]}         | ${[]}            | ${[]}
        ${"This should've been ok"}     | ${[]}         | ${[]}            | ${[]}
        ${"This should've not been ok"} | ${[]}         | ${["should've"]} | ${[ov({ text: "should've", isFlagged: true })]}
        ${"They'll be allowed"}         | ${[]}         | ${[]}            | ${[]}
        ${"They'll not be allowed"}     | ${[]}         | ${["they'll"]}   | ${[ov({ text: "They'll", isFlagged: true })]}
    `('Validate forbidden words', ({ text, ignoreWords, expected, flagWords }) => {
        const dict = getSpellingDictionaryCollectionSync({ ignoreWords });
        const result = [...validateText(text, dict, { ignoreCase: false, flagWords })];
        expect(result).toEqual(expected);
    });
});

interface WithIgnoreWords {
    ignoreWords?: string[];
}

async function getSpellingDictionaryCollection(options?: WithIgnoreWords) {
    return getSpellingDictionaryCollectionSync(options);
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
    'allowed',
    'and',
    'ate',
    'be',
    'been',
    'better',
    'big',
    'dark',
    'done',
    'fixes',
    'has',
    'have',
    'is',
    'known',
    'light',
    'little',
    'multiple',
    'not',
    'problems',
    'published',
    'should',
    'the',
    'they',
    'this',
    'to',
    'we',
    "'ll",
    "couldn't",
    "should've",
    "shouldn't",
    "they'll",
    "they've",
];

const forbiddenWords = ['!colour', '!favour'];

const specialWords = ['Range8', '4wheel', 'db2Admin', 'Amsterdam', 'Berlin', 'Paris'];

const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;

function getSpellingDictionaryCollectionSync(options?: WithIgnoreWords) {
    const dicts = [
        createSpellingDictionary(colors, 'colors', 'test', opts()),
        createSpellingDictionary(fruit, 'fruit', 'test', opts()),
        createSpellingDictionary(animals, 'animals', 'test', opts()),
        createSpellingDictionary(insects, 'insects', 'test', opts()),
        createSpellingDictionary(words, 'words', 'test', opts({ repMap: [['’', "'"]] })),
        createSpellingDictionary(forbiddenWords, 'forbidden-words', 'test', opts()),
        createSpellingDictionary(
            options?.ignoreWords || [],
            'ignore-words',
            'test',
            opts({
                caseSensitive: true,
                noSuggest: true,
            })
        ),
    ];

    return createCollection(dicts, 'collection');
}

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}

function ov<T>(t: Partial<T>, ...rest: Partial<T>[]): T {
    return expect.objectContaining(Object.assign({}, t, ...rest));
}
