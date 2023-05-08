import { describe, expect, test } from 'vitest';

import { createTriFromList } from '../../index.js';
import { readTrie } from '../../test/dictionaries.test.helper.js';
import type { TrieNode } from '../TrieNode.js';
import { FastTrieBlob } from './FastTrieBlob.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

describe('Validate English Trie', () => {
    const pTrie = getTrie();

    // cspell:ignore setsid macukrainian
    test.each`
        word              | useCompound | expected
        ${'setsid'}       | ${true}     | ${true}
        ${'hello'}        | ${true}     | ${true}
        ${'set'}          | ${true}     | ${true}
        ${'sid'}          | ${true}     | ${true}
        ${'setsid'}       | ${true}     | ${true}
        ${'macukrainian'} | ${true}     | ${true}
        ${'setsid'}       | ${false}    | ${false}
        ${'macukrainian'} | ${false}    | ${false}
    `(
        'has "$word" useCompound: $useCompound',
        async ({ word, expected, useCompound }) => {
            const trie = await pTrie;
            expect(trie.has(word, useCompound)).toBe(expected);
        },
        timeout
    );

    test('Count Nodes', async () => {
        interface CountResult {
            nodes: number;
            refs: number;
            refsByCount: number[];
            alphabet: Map<string, number>;
        }
        function countNodesAndRefs(root: TrieNode): CountResult {
            const result: CountResult = { nodes: 0, refs: 0, refsByCount: [], alphabet: new Map() };
            const seen = new Set<TrieNode>();
            function walker(node: TrieNode) {
                if (seen.has(node)) return;
                seen.add(node);
                result.nodes += 1;
                if (!node.c) {
                    result.refsByCount[0] = (result.refsByCount[0] || 0) + 1;
                    return;
                }
                const size = Object.entries(node.c).length;
                result.refsByCount[size] = (result.refsByCount[size] || 0) + 1;
                result.refs += size;
                for (const [key, child] of Object.entries(node.c)) {
                    for (const char of key.normalize('NFD')) {
                        incEntry(result.alphabet, char);
                    }
                    walker(child);
                }
            }
            walker(root);
            result.alphabet.clear();
            return result;
        }

        const trie = await pTrie;
        const root = trie.root;
        const r = countNodesAndRefs(root);
        const calc = {
            'Expected size': r.nodes + r.refs * 4,
            Average: r.refs / r.nodes,
        };
        console.log('Result: %o', r);
        console.log('Calculations: %o', calc);
        expect(r.nodes).toBeGreaterThan(1000);
    });

    test('x', async () => {
        const trie = await pTrie;
        const words = trie.words().toArray();

        const ft = new FastTrieBlob();
        measure('FastTrieBlob', () => ft.insert(words));
        const result = [...ft.words()];
        expect(result).toEqual(words);
        measure('createTriFromList', () => createTriFromList(words));
    });
});

function incEntry<K>(map: Map<K, number>, key: K) {
    map.set(key, (map.get(key) || 0) + 1);
}

function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} ${(end - start).toFixed(3)} milliseconds.`);
}
