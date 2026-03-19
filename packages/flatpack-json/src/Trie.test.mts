import { describe, expect, it } from 'vitest';

import { Trie, TrieOfStrings } from './Trie.mjs';

describe('Trie', () => {
    it('should create an empty trie', () => {
        const trie = new Trie<string, number>();
        expect(trie.size).toBe(0);
        expect(trie.root).toEqual({});
    });

    it('should set and get a value', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b', 'c'], 123);
        expect(trie.get(['a', 'b', 'c'])).toBe(123);
    });

    it('should return undefined for non-existent keys', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        expect(trie.get(['x', 'y'])).toBeUndefined();
        expect(trie.get(['a', 'b', 'c'])).toBeUndefined();
    });

    it('should support has() method', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        expect(trie.has(['a', 'b'])).toBe(true);
        expect(trie.has(['a'])).toBe(false);
        expect(trie.has(['a', 'b', 'c'])).toBe(false);
    });

    it('should update existing keys', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 10);
        expect(trie.size).toBe(1);
        expect(trie.get(['a', 'b'])).toBe(10);
        trie.set(['a', 'b'], 20);
        expect(trie.size).toBe(1);
        expect(trie.get(['a', 'b'])).toBe(20);
    });

    it('should correctly track size', () => {
        const trie = new Trie<string, number>();
        expect(trie.size).toBe(0);
        trie.set(['a'], 1);
        expect(trie.size).toBe(1);
        trie.set(['b'], 2);
        expect(trie.size).toBe(2);
        trie.set(['a'], 3); // updating should not increase size
        expect(trie.size).toBe(2);
    });

    it('should support common prefixes', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b', 'c'], 1);
        trie.set(['a', 'b', 'd'], 2);
        trie.set(['a', 'x'], 3);
        expect(trie.get(['a', 'b', 'c'])).toBe(1);
        expect(trie.get(['a', 'b', 'd'])).toBe(2);
        expect(trie.get(['a', 'x'])).toBe(3);
    });

    it('should support numbers as keys', () => {
        const trie = new Trie<number, string>();
        trie.set([1, 2, 3], 'a');
        trie.set([1, 2, 4], 'b');
        expect(trie.get([1, 2, 3])).toBe('a');
        expect(trie.get([1, 2, 4])).toBe('b');
    });

    it('should clear the trie', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        trie.set(['c', 'd'], 100);
        expect(trie.size).toBe(2);
        trie.clear();
        expect(trie.size).toBe(0);
        expect(trie.root).toEqual({});
        expect(trie.get(['a', 'b'])).toBeUndefined();
    });

    it('should find node with full match', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b', 'c'], 42);
        const result = trie.findNode(['a', 'b', 'c']);
        expect(result).toBeDefined();
        expect(result?.found).toBe(true);
        expect(result?.node.d).toBe(42);
        expect(result?.path).toEqual(['a', 'b', 'c']);
    });

    it('should find node with partial match', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b', 'c'], 42);
        const result = trie.findNode(['a', 'b', 'x']);
        expect(result).toBeDefined();
        expect(result?.found).toBe(false);
        expect(result?.path).toEqual(['a', 'b']);
    });

    it('should return undefined for findNode on empty trie', () => {
        const trie = new Trie<string, number>();
        const result = trie.findNode(['a']);
        expect(result).toEqual({ node: {}, found: false, path: [] });
    });

    it('should handle empty key', () => {
        const trie = new Trie<string, number>();
        trie.set([], 42);
        expect(trie.get([])).toBe(42);
        expect(trie.has([])).toBe(true);
    });

    it('should handle complex data types', () => {
        const trie = new Trie<string, { id: number; name: string }>();
        const data = { id: 1, name: 'test' };
        trie.set(['key'], data);
        expect(trie.get(['key'])).toEqual(data);
    });

    it('delete should remove a key', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        expect(trie.delete(['a', 'b'])).toBe(true);
        expect(trie.get(['a', 'b'])).toBeUndefined();
        expect(trie.size).toBe(0);
    });

    it('delete should return false for non-existent keys', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        expect(trie.delete(['x', 'y'])).toBe(false);
        expect(trie.delete(['a', 'b', 'c'])).toBe(false);
    });

    it('delete should not affect other keys', () => {
        const trie = new Trie<string, number>();
        trie.set(['a', 'b'], 42);
        trie.set(['a', 'c'], 100);
        trie.set('abc', 101);
        expect(trie.delete(['a', 'b'])).toBe(true);
        expect(trie.get(['a', 'c'])).toBe(100);
        expect(trie.get(['a', 'b', 'c'])).toBe(101);
    });
});

describe('TrieOfStrings', () => {
    it('should create an empty trie', () => {
        const trie = new TrieOfStrings<number>();
        expect(trie.root).toEqual({ d: undefined, c: new Map() });
    });

    it('should add and find a string', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('hello', 42);
        const result = trie.find('hello');
        expect(result).toBeDefined();
        expect(result?.data).toBe(42);
        expect(result?.found).toBe('hello');
    });

    it('should find partial matches and return found string', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('hello', 42);
        const result = trie.find('hel');
        expect(result).toBeDefined();
        expect(result?.found).toBe('hel');
    });

    it('should return undefined for non-existent keys', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('hello', 42);
        expect(trie.find('world')).toEqual({ data: undefined, found: '' });
    });

    it('should support add with iterable', () => {
        const trie = new TrieOfStrings<string>();
        trie.add(['h', 'e', 'l', 'l', 'o'], 'greeting');
        const result = trie.find(['h', 'e', 'l', 'l', 'o']);
        expect(result?.found).toBe('hello');
    });

    it('should handle multiple strings with common prefixes', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('cat', 1);
        trie.add('car', 2);
        trie.add('card', 3);
        expect(trie.find('cat')?.data).toBe(1);
        expect(trie.find('car')?.data).toBe(2);
        expect(trie.find('card')?.data).toBe(3);
    });

    it('findNode should return correct node and path', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('hello', 42);
        const result = trie.findNode('hello');
        expect(result).toBeDefined();
        expect(result?.found).toBe(true);
        expect(result?.path).toEqual(['h', 'e', 'l', 'l', 'o']);
    });

    it('findNode should return partial match information', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('hello', 42);
        const result = trie.findNode('head');
        expect(result).toBeDefined();
        expect(result?.found).toBe(false);
        expect(result?.path).toEqual(['h', 'e']);
    });

    it('does not handle empty strings, but should be fixed', () => {
        const trie = new TrieOfStrings<number>();
        trie.add('', 42);
        const result = trie.find('');
        expect(result?.data).toBe(undefined);
        expect(result?.found).toBe('');
    });

    it('should handle complex data types', () => {
        const trie = new TrieOfStrings<{ id: string; value: number }>();
        const data = { id: 'test-1', value: 100 };
        trie.add('key', data);
        const result = trie.find('key');
        expect(result?.data).toEqual(data);
    });
});
