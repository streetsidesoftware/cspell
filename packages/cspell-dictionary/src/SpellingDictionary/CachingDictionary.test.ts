import { createCachingDictionary } from './CachingDictionary';
import { createSpellingDictionary } from './createSpellingDictionary';

describe('CachingDictionary', () => {
    const words = ['apple', 'banana', 'orange', 'grape', 'mango'];
    const dict = createSpellingDictionary(words, '[words]', 'source');

    test('hits', () => {
        const cd = createCachingDictionary(dict, {});
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('Apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.has('apple')).toBe(true);
        expect(cd.stats()).toEqual({ has: { hits: 1 } });
    });
});
