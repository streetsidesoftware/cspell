import { describe, expect, test } from 'vitest';

import { GTrie } from './GTrie.js';

describe('GTrie', () => {
    test('should create an empty trie', () => {
        const trie = new GTrie<string, number>();
        expect(trie).toBeDefined();
        expect(trie.hasNode('')).toBe(true);
        expect(trie.has('')).toBe(false);
    });

    test('should add and find words', () => {
        const trie = new GTrie<string, number>();
        trie.insert('hello', 'hello'.length);
        trie.insert('world', 'world'.length);

        expect(trie.has('hello')).toBe(true);
        expect(trie.has('world')).toBe(true);
        expect(trie.has('test')).toBe(false);
    });

    test('should handle empty string', () => {
        const trie = new GTrie<string, number>();
        trie.insert('', 0);
        expect(trie.has('')).toBe(true);
    });

    test('should handle words with common prefixes', () => {
        const trie = new GTrie<string, number>();
        trie.insert('test', 'test'.length);
        trie.insert('testing', 'testing'.length);
        trie.insert('tester', 'tester'.length);

        expect(trie.has('test')).toBe(true);
        expect(trie.has('testing')).toBe(true);
        expect(trie.has('tester')).toBe(true);
        expect(trie.has('tes')).toBe(false);
    });

    test('should support multiple insertions of the same word', () => {
        const trie = new GTrie<string, string>();
        expect(trie.insert('duplicate', 'first')).toBeUndefined();
        expect(trie.insert('duplicate', 'second')).toBe('first');
        expect(trie.insert('duplicate', 'third')).toBe('second');
        expect(trie.get('duplicate')).toBe('third');
    });

    test('should handle unicode characters', () => {
        const trie = new GTrie<string, string>();
        trie.insert('café', 'café');
        trie.insert('日本語', '日本語');
        trie.insert('emoji😀', 'emoji😀');

        expect(trie.has('café')).toBe(true);
        expect(trie.has('日本語')).toBe(true);
        expect(trie.has('emoji😀')).toBe(true);
    });

    test('should create trie from entries', () => {
        const map = new Map(['apple', 'application', 'apply', 'banana', 'band'].map((word) => [word, word.length]));
        const trie = GTrie.fromEntries(map);

        expect(trie.get('apple')).toBe(map.get('apple'));
        expect(trie.get('application')).toBe(map.get('application'));
        expect(trie.get('apply')).toBe(map.get('apply'));
        expect(trie.get('banana')).toBe(map.get('banana'));
        expect(trie.get('band')).toBe(map.get('band'));
        expect(trie.get('app')).toBe(map.get('app'));
    });
});
