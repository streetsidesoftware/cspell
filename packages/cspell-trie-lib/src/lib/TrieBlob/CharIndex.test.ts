import { describe, expect, test } from 'vitest';

import { CharIndexBuilder } from './CharIndex.js';

describe('CharIndexBuilder', () => {
    test('build char index', () => {
        const textEncoder = new TextEncoder();
        const charIndexBuilder = new CharIndexBuilder();
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        const indexes = letters.map((c) => charIndexBuilder.getUtf8Value(c));
        expect(indexes).toEqual(letters.map((c) => c.codePointAt(0)));
        const r = charIndexBuilder.wordToUtf8Seq('abcdefghij⚁⚂⚃⚄⚀');
        expect(r).toEqual([...textEncoder.encode('abcdefghij⚁⚂⚃⚄⚀')]);
        expect(charIndexBuilder.size).toBe(16); // One extra for the empty string.

        // Add the same letters again.
        expect(letters.map((c) => charIndexBuilder.getUtf8Value(c))).toEqual(letters.map((c) => c.codePointAt(0)));

        const charIndex = charIndexBuilder.build();
        expect(charIndex.size).toBe(16);
        expect(charIndex.wordToUtf8Seq('abcdefghij')).toEqual([...textEncoder.encode('abcdefghij')]);
    });
});
