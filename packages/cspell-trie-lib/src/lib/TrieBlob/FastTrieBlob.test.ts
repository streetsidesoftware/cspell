import { describe, expect, test } from 'vitest';

import { createTrieFromList } from '../TrieNode/trie-util.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

describe('FastTrieBlob', () => {
    const words = ['one', 'two', 'three', 'four', 'walk', 'walking', 'walks', 'wall', 'walls', 'walled'];

    test('insert', () => {
        const ft = new FastTrieBlobBuilder();
        ft.insert(words);
        ft.insert('hello');
        expect(ft.has('hello')).toBe(true);
        expect(ft.has('Hello')).toBe(false);
        ft.insert('Hello');
        expect(ft.has('Hello')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
    });

    test('createTriFromList', () => {
        const root = createTrieFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        expect(ft.has('walk')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
        expect(ft.has('hello')).toBe(false);
    });
});
