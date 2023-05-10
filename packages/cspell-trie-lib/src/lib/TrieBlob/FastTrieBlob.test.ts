import { describe, expect, test } from 'vitest';

import { createTriFromList } from '../trie-util.js';
import { FastTrieBlob } from './FastTrieBlob.js';

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('insert', () => {
        const ft = new FastTrieBlob();
        ft.insert(words);
        ft.insert('hello');
        expect(ft.has('hello')).toBe(true);
        expect(ft.has('Hello')).toBe(false);
        ft.insert('Hello');
        expect(ft.has('Hello')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
    });

    test('', () => {
        const root = createTriFromList(words);
        const ft = FastTrieBlob.fromTrieRoot(root);
        expect(ft.has('walk')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
        expect(ft.has('hello')).toBe(false);
    });
});
