import { describe, expect, test } from 'vitest';

import { createITrieFromList } from '../TrieNode/trie-util.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { walkerWordsITrie } from '../walker/walker.js';
import { createTrieBlob, createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieData } from './createTrieBlob.js';
import { TrieBlob } from './TrieBlob.js';

describe('TrieBlob', () => {
    const sampleWords = [
        'one',
        'two',
        'three',
        'four',
        'walk',
        'walking',
        'walks',
        'wall',
        'walls',
        'walled',
        '😀😎',
    ].sort();

    test('Constructor', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb).toBeDefined();
    });

    test('has', () => {
        const tb = createTrieBlob(['one', 'two']);
        expect(tb.has('one')).toBe(true);
        expect(tb.has('zero')).toBe(false);
    });

    test('words', () => {
        const tb = createTrieBlob(sampleWords);
        expect([...tb.words()]).toEqual(sampleWords);
        tb.encodeBin();
    });

    test('encode/decode', () => {
        const tb = createTrieBlob(sampleWords);
        const bin = tb.encodeBin();
        const r = TrieBlob.decodeBin(bin);
        expect(r.toJSON()).toEqual(tb.toJSON());
        expect([...r.words()]).toEqual(sampleWords);
    });

    test('createTrieBlobFromITrieNodeRoot', () => {
        const root = createITrieFromList(sampleWords);
        const trieBlob = createTrieBlobFromITrieNodeRoot(root);
        expect([...trieBlob.words()]).toEqual(sampleWords);
    });

    test('createTrieBlobFromTrieData', () => {
        const root = TrieNodeTrie.createFromWords(sampleWords);
        const trieBlob = createTrieBlobFromTrieData(root);
        expect([...trieBlob.words()]).toEqual(sampleWords);
    });

    test('toITrieNodeRoot', () => {
        const root = createITrieFromList(sampleWords);
        const trieBlob = createTrieBlobFromITrieNodeRoot(root);
        const iter = walkerWordsITrie(trieBlob.getRoot());
        expect([...iter]).toEqual(sampleWords);
    });
});

describe('TrieBlob special character indexes', () => {
    test.each`
        index
        ${0}
        ${240}
        ${TrieBlob.SpecialCharIndexMask}
        ${TrieBlob.SpecialCharIndexMask + 1}
        ${1024}
    `('number to sequence $index', ({ index }) => {
        const seq = TrieBlob.toCharIndexSequence(index);
        const r = [...TrieBlob.fromCharIndexSequence(seq)];
        expect(r).toEqual([index]);
    });

    test('mapping characters', () => {
        const characters = 'this is a test of a few characters and accents: é ♘😀😎🥳';
        const map = Object.fromEntries(
            [...new Set([...characters]).values()].map((c) => [c, c.codePointAt(0)] as [string, number]),
        );
        const charIndex = Object.fromEntries(Object.entries(map).map(([c, i]) => [i, c])) as Record<number, string>;
        const seq = TrieBlob.charactersToCharIndexSequence([...characters], map);
        const r = TrieBlob.charIndexSequenceToCharacters(seq, charIndex);
        expect(r.join('')).toBe(characters);
    });
});
