import { describe, expect, test } from 'vitest';

import { readTrie } from '../test/dictionaries.test.helper.js';
import type { TrieNode } from './TrieNode.js';

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
        }
        function countNodesAndRefs(root: TrieNode): CountResult {
            const result: CountResult = { nodes: 0, refs: 0 };
            const seen = new Set<TrieNode>();
            function walker(node: TrieNode) {
                if (seen.has(node)) return;
                seen.add(node);
                result.nodes += 1;
                if (!node.c) return;
                result.refs += node.c.size;
                for (const child of node.c.values()) {
                    walker(child);
                }
            }
            walker(root);
            return result;
        }

        const trie = await pTrie;
        const root = trie.root;
        const r = countNodesAndRefs(root);
        // console.log('%o', r);
        // console.log(`Expected size to be ${(r.nodes + r.refs) * 4}`);
        expect(r.nodes).toBeGreaterThan(1000);
    });
});
