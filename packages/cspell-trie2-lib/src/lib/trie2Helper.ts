import { Trie2, isTrieNode2Branch } from './trie2';
import { TrieNode2 } from './TrieNode2';

export function displayTrie2(trie: Trie2, sort = false, dot = '.') {
    function *walk(nodes: TrieNode2[], prefix: string): Generator<string> {
        const i = sort ? [...nodes].sort((a, b) => a.s.localeCompare(b.s)) : nodes;
        const dots = dot.repeat(prefix.length);
        for (const n of i) {
            if (!n.s) {
                yield prefix;
            }
            if (isTrieNode2Branch(n)) {
                yield *walk(n.c, prefix + n.s);
            }
            prefix = dots;
        }
    }

    return [...walk(trie.root.c, ''), ''].join('\n');
}
