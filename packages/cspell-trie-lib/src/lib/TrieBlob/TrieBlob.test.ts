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

    test('node count', () => {
        const n = countNodesMatching(trieBlob, 1, 0xff);
        const lengths = countNodeLengths(trieBlob);
        const refCounts = countNodeReferences(trieBlob);

        // A bit of analyze about the nodes.
        // We want to get an idea of the distribution of node sizes and references.

        // // How many nodes have only 1 child? Reducing the size of these nodes would help a lot. Approx 30%
        // console.log(
        //     `Total nodes: ${trieBlob.nodes.length}, Nodes with 1 child: ${n} (${((n / trieBlob.nodes.length) * 100).toFixed(2)}%)`,
        // );
        // console.log('Node lengths distribution: %o', lengths);
        // console.log('Top 100 node references: %o', new Map([...refCounts.entries()].slice(0, 100)));
        expect(n).toBeLessThan(trieBlob.nodes.length / 2);
        expect(lengths.size).toBeGreaterThan(10);
        expect(refCounts.size).toBeGreaterThan(100);
    });

    test('encode hexDump', () => {
        const words = ['apple', 'banana', 'grape', 'orange', 'strawberry'];
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const bin = ft.encodeToBTrie();
        const r = TrieBlob.decodeBin(bin);
        expect([...r.words()]).toEqual(words);
        expect(hexDump(bin)).toMatchSnapshot();
    });

    test('#findNode magic numbers', () => {
        // Verify that the magic numbers used in #findNode are correct.
        expect(TrieBlob.NodeMaskNumChildren, 'TrieBlob.NodeMaskNumChildren has changed, update #findNode.').toBe(0xff);
        expect(TrieBlob.NodeChildRefShift, 'TrieBlob.NodeChildRefShift has changed, update #findNode.').toBe(8);
    });
});

function countNodesMatching(blob: TrieBlob, pattern: number, mask: number): number {
    let count = 0;
    const nodes = blob.nodes;
    for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i] & mask) === pattern) {
            count++;
        }
    }
    return count;
}

function countNodeLengths(blob: TrieBlob): Map<number, [number, number]> {
    const lengths = new Map<number, number>();
    const nodes = blob.nodes;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const numChildren = node & TrieBlob.NodeMaskNumChildren;
        i += numChildren;
        lengths.set(numChildren, (lengths.get(numChildren) || 0) + 1);
    }

    let cnt = 0;
    const entries = [...lengths.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([length, count]) => [length, [count, (cnt += count)]] as [number, [number, number]]);
    return new Map(entries);
}

function countNodeReferences(blob: TrieBlob): Map<number, number> {
    const refs = new Map<number, number>();
    const nodes = blob.nodes;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const numChildren = node & TrieBlob.NodeMaskNumChildren;
        for (let j = 1; j <= numChildren; j++) {
            const childRef = nodes[i + j] >>> TrieBlob.NodeChildRefShift;
            refs.set(childRef, (refs.get(childRef) || 0) + 1);
        }
        i += numChildren;
    }

    const entries = [...refs.entries()].sort((a, b) => b[1] - a[1]);

    return new Map(entries);
}

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
