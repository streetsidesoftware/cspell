import { describe, expect, test } from 'vitest';

import type { TrieNode } from '../lib/TrieNode/TrieNode.js';
import { readTrieFromConfig } from '../test/dictionaries.test.helper.js';

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

describe('Validate English FastTrieBlob', async () => {
    const pTrie = getTrie();

    test(
        'Count Nodes',
        async () => {
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
            // const calc = {
            //     'Expected size': r.nodes + r.refs * 4,
            //     Average: r.refs / r.nodes,
            // };
            // console.log('Result: %o', r);
            // console.log('Calculations: %o', calc);
            expect(r.nodes).toBeGreaterThan(1000);
        },
        timeout
    );
});

function incEntry<K>(map: Map<K, number>, key: K) {
    map.set(key, (map.get(key) || 0) + 1);
}
