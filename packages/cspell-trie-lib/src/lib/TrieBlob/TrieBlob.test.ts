import { describe, expect, test } from 'vitest';

import { readFastTrieBlobFromConfig } from '../../test/dictionaries.test.helper.js';
import { validateTrie } from '../TrieNode/trie-util.js';
import { buildTrieNodeTrieFromWords } from '../TrieNode/TrieNodeBuilder.js';
import { createTrieBlob } from './createTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';
import { hexDump } from './hexDump.ts';
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

    test('test compounds and non-strict', () => {
        const words = getWordsDictionary();
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const t = ft.toTrieBlob();
        expect(words.findIndex((word) => !t.has(word))).toBe(-1);
        expect([...t.words()].sort()).toEqual([...words].sort());

        expect(t.has('English')).toBe(true);
        expect(t.has('english')).toBe(false);
        expect(t.has('~english')).toBe(true);
        expect(t.hasForbiddenWords).toBe(false);
        expect(t.hasCompoundWords).toBe(true);
        expect(t.hasNonStrictWords).toBe(true);
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

    test('encode hexDump', () => {
        const words = ['apple', 'banana', 'grape', 'orange', 'strawberry'];
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const bin = ft.encodeToBTrie();
        const r = TrieBlob.decodeBin(bin);
        expect([...r.words()]).toEqual(words);
        expect(hexDump(bin)).toMatchSnapshot();
    });
});

function makeCompoundable(word: string): string {
    return `+${word}+`;
}

function makeNonStrict(word: string): string {
    return `~${word.toLowerCase()}`;
}

function getWordsDictionary(): string[] {
    // cspell:ignore wintrap
    const properNames = ['English', 'Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'];
    const fruit = ['apple', 'banana', 'grape', 'orange', 'strawberry'];

    const wordLists = [properNames, properNames.map(makeNonStrict), fruit, fruit.map(makeCompoundable)];

    return wordLists.flat();
}
