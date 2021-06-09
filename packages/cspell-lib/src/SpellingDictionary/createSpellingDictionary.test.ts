import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const error = new Error('error');
        const loaderError = new SpellingDictionaryLoadError(
            './missing.txt',
            { name: 'failed dict', path: './missing.txt' },
            error,
            'Failed to load'
        );
        const d = createFailedToLoadDictionary(loaderError);
        expect(d).toBeTruthy();

        expect(d.getErrors?.()).toEqual([loaderError]);
        expect(d.suggest('error')).toEqual([]);
        expect(d.mapWord('café')).toBe('café');
        expect(d.has('fun')).toBe(false);
    });

    test('createSpellingDictionary', () => {
        const words = ['one', 'two', 'three', 'left-right'];
        const d = createSpellingDictionary(words, 'test create', __filename);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });
});
