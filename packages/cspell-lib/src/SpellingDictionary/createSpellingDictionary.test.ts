import { SpellingDictionaryOptions } from '.';
import { DictionaryInformation } from '..';
import { mapDictDefToInternal } from '../Settings/DictionarySettings';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

const di = mapDictDefToInternal;

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const error = new Error('error');
        const loaderError = new SpellingDictionaryLoadError(
            './missing.txt',
            di({ name: 'failed dict', path: './missing.txt' }, __filename),
            error,
            'Failed to load'
        );
        const d = createFailedToLoadDictionary(loaderError);
        expect(d).toBeTruthy();

        expect(d.getErrors?.()).toEqual([loaderError]);
        expect(d.suggest('error')).toEqual([]);
        expect(d.mapWord('café')).toBe('café');
        expect(d.has('fun')).toBe(false);
        expect(d.find('hello')).toBeUndefined();
        expect(d.isNoSuggestWord('hello', {})).toBe(false);
    });

    test('createSpellingDictionary', () => {
        const words = ['one', 'two', 'three', 'left-right'];
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    test('createSpellingDictionary fa', () => {
        // cspell:disable-next-line
        const words = ['آئینهٔ', 'آبادهٔ', 'کلاه'];
        expect(words).toEqual(words.map((w) => w.normalize('NFC')));
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    test('createSpellingDictionary fa legacy', () => {
        // cspell:disable-next-line
        const words = ['آئینهٔ', 'آبادهٔ', 'کلاه'];
        expect(words).toEqual(words.map((w) => w.normalize('NFC')));
        const d = createSpellingDictionary(
            words.map((w) => w.replace(/\p{M}/gu, '')),
            'test create',
            __filename,
            opts({ caseSensitive: false })
        );
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    // cspell:ignore Geschäft Aujourd'hui
    test('createSpellingDictionary accents', () => {
        const words = ['Geschäft'.normalize('NFD'), 'café', 'book', "Aujourd'hui"];
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
        words.map((w) => w.toLowerCase()).forEach((w) => expect(d.has(w)).toBe(true));
        expect(d.has(words[0].toLowerCase())).toBe(true);
        expect(d.has(words[0].toLowerCase(), { ignoreCase: false })).toBe(false);
        expect(d.suggest('geschaft', { ignoreCase: true }).map((r) => r.word)).toEqual([
            'geschaft',
            'geschäft',
            'Geschäft',
        ]);
        expect(d.suggest('geschaft', { ignoreCase: false }).map((r) => r.word)).toEqual(['Geschäft']);
    });

    // cspell:ignore fone failor
    test.each`
        word          | ignoreCase | expected
        ${'Geschäft'} | ${false}   | ${[c('Geschäft', 0)]}
        ${'Geschaft'} | ${false}   | ${[c('Geschäft', 1)]}
        ${'fone'}     | ${false}   | ${[c('phone', 70), c('gone', 104)]}
        ${'failor'}   | ${false}   | ${[c('failure', 70), c('sailor', 104), c('failed', 175), c('fail', 200)]}
    `('createSpellingDictionary with dictionaryInformation "$word" "$ignoreCase"', ({ word, ignoreCase, expected }) => {
        const words = sampleWords();
        const options = { ...opts(), dictionaryInformation: sampleDictionaryInformation({}) };
        const d = createSpellingDictionary(words, 'test create', __filename, options);
        expect(d.suggest(word, { ignoreCase, numSuggestions: 4 })).toEqual(expected);
    });
});

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}

function c(word: string, cost: number) {
    return { word, cost };
}

function sampleDictionaryInformation(di: DictionaryInformation = {}): DictionaryInformation {
    const d: DictionaryInformation = {
        suggestionEditCosts: [
            {
                map: 'f(ph)(gh)|(ail)(ale)|(ur)(er)(ure)(or)',
                replace: 70,
            },
            {
                map: 'aeiou', // cspell:ignore aeiou
                replace: 75,
                swap: 75,
            },
            {
                description: 'common vowel sounds.',
                map: 'o(oh)(oo)|(oo)(ou)|(oa)(ou)',
                replace: 65,
            },
        ],
        ...di,
    };
    return d;
}

function sampleWords() {
    return [
        ...['Geschäft'.normalize('NFD'), 'café', 'book', "Aujourd'hui", 'cafe'],
        ...['go', 'going', 'goes', 'gone'],
        ...['phone', 'fall', 'phones', 'phoning', 'call', 'caller', 'called'],
        ...['fail', 'fall', 'failed', 'failing', 'failure'],
        ...['enough', 'though', 'through'],
        ...['soup', 'soap', 'sooth', 'boot', 'boat'],
        ...['sail', 'sailor', 'sailing', 'sails', 'sailed'],
        ...['sale', 'sold', 'sales', 'selling'],
        ...['tale', 'tail'],
    ];
}
