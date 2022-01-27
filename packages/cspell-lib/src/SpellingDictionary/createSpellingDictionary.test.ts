import { SpellingDictionaryOptions } from '.';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const error = new Error('error');
        const loaderError = new SpellingDictionaryLoadError(
            './missing.txt',
            { name: 'failed dict', path: './missing.txt', weightMap: undefined, __source: undefined },
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
});

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}
