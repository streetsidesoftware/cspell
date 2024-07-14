import { describe, expect, test } from 'vitest';

import { readFastTrieBlobFromConfig } from '../../test/dictionaries.test.helper.js';
import { createITrieFromList, validateTrie } from '../TrieNode/trie-util.js';
import { buildTrieNodeTrieFromWords } from '../TrieNode/TrieNodeBuilder.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { walkerWordsITrie } from '../walker/walker.js';
import { createTrieBlob, createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieData } from './createTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';
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
        expect([...trieBlob.words()].sort()).toEqual(sampleWords);
    });

    test('createTrieBlobFromTrieData', () => {
        const root = TrieNodeTrie.createFromWords(sampleWords);
        const trieBlob = createTrieBlobFromTrieData(root);
        expect([...trieBlob.words()].sort()).toEqual(sampleWords);
    });

    test('toITrieNodeRoot', () => {
        const root = createITrieFromList(sampleWords);
        const trieBlob = createTrieBlobFromITrieNodeRoot(root);
        const iter = walkerWordsITrie(trieBlob.getRoot());
        expect([...iter].sort()).toEqual(sampleWords);
    });

    test('from Trie', () => {
        const trie = buildTrieNodeTrieFromWords(sampleWords);
        expect([...trie.words()]).toEqual(sampleWords);
        expect(sampleWords.some((w) => !trie.has(w))).toBe(false);
        expect(validateTrie(trie.root).isValid).toBe(true);
        const ft = FastTrieBlobBuilder.fromTrieRoot(trie.root);
        // console.error('%o', JSON.parse(JSON.stringify(ft)));
        expect([...ft.words()].sort()).toEqual(sampleWords);
        expect(sampleWords.some((w) => !ft.has(w))).toBe(false);
        const tb = ft.toTrieBlob();
        expect(sampleWords.some((w) => !tb.has(w))).toBe(false);
    });
});

describe('TrieBlob encode/decode', async () => {
    const ft = await readFastTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
    const trieBlob = ft.toTrieBlob();

    test('encode/decode', () => {
        const words = [...trieBlob.words()];
        const bin = trieBlob.encodeBin();
        const r = TrieBlob.decodeBin(bin);
        expect([...r.words()]).toEqual(words);
        expect(words.some((w) => !r.has(w))).toBe(false);
    });
});
