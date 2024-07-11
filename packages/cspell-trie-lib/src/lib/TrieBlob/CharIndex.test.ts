import { describe, expect, test } from 'vitest';

import { CharIndexBuilder } from './CharIndex.js';

describe('CharIndexBuilder', () => {
    test('build char index', () => {
        const charIndexBuilder = new CharIndexBuilder();
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        const indexes = letters.map((c) => charIndexBuilder.getCharIndex(c));
        expect(indexes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const r = charIndexBuilder.wordToCharIndexSequence('abcdefghij');
        expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(charIndexBuilder.size).toBe(11); // One extra for the empty string.

        // Add the same letters again.
        expect(letters.map((c) => charIndexBuilder.getCharIndex(c))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        const charIndex = charIndexBuilder.build();
        expect(charIndex.size).toBe(11);
        expect(charIndex.wordToCharIndexSequence('abcdefghij')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
});
