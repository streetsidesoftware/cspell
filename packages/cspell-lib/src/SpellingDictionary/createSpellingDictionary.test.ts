import { createFailedToLoadDictionary } from './createSpellingDictionary';

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const errors = [new Error('error')];
        const d = createFailedToLoadDictionary('failed dict', './missing.txt', 'S', errors);
        expect(d).toBeTruthy();

        expect(d.getErrors?.()).toEqual(errors);
        expect(d.suggest('error')).toEqual([]);
        expect(d.mapWord('café')).toBe('café');
        expect(d.has('fun')).toBe(false);
    });
});
