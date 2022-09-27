import { createCachingDictionary } from './CachingDictionary';
import { createSpellingDictionary } from './createSpellingDictionary';

const oc = expect.objectContaining;

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
        expect(cd.stats()).toEqual(oc({ has: { hits: 4, misses: 2, swaps: 0 } }));
    });
});
