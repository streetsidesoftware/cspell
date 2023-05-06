import type { TrieNode } from '../lib/TrieNode.js';

export function emitTrieWords(trie: TrieNode) {
    let count = 0;
    function walk(trie: TrieNode, pfx = '') {
        if (trie.f) {
            console.warn(pfx);
            count++;
        }
        if (!trie.c) return;
        for (const [k, v] of Object.entries(trie.c)) {
            walk(v, pfx + k);
        }
    }
    walk(trie);
    console.warn('count: %i', count);
}
