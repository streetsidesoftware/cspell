import { createFailedToLoadDictionary } from './createSpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const error = new Error('error');
        const loaderError = new SpellingDictionaryLoadError(
            'failed dict',
            './missing.txt',
            {},
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
});
