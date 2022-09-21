import { createCollection, SpellingDictionaryOptions } from '../SpellingDictionary';
import { createSpellingDictionary } from '../SpellingDictionary/SpellingDictionaryLibOld/createSpellingDictionary';
import { __testing__, IsWordValidOptions } from './isWordValid';

const { hasWordCheck } = __testing__;

// cspell:ignore whiteberry redmango lightbrown redberry

describe('Validate textValidator functions', () => {
    test('tests hasWordCheck', async () => {
        // cspell:ignore redgreenblueyellow strawberrymangobanana redwhiteblue
        const dictCol = await getSpellingDictionaryCollection();
        const opt: IsWordValidOptions = {
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

// cspell:ignore colour
const forbiddenWords = ['!colour', '!favour'];

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
