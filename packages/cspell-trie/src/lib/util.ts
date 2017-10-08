import {Sequence, genSequence} from 'gensequence';
import {TrieNode, FLAG_WORD, ChildMap} from './TrieNode';
import {YieldResult, walker} from './walker';

export {YieldResult} from './walker';

export function insert(text: string, node: TrieNode = {}): TrieNode {
    if (text.length) {
        const head = text[0];
        const tail = text.slice(1);
        node.c = node.c || new ChildMap();
        node.c.set(head, insert(tail, node.c.get(head)));
    } else {
        node.f = (node.f || 0) | FLAG_WORD;
    }
    return node;
}

export function isWordTerminationNode(node: TrieNode) {
    return ((node.f || 0) & FLAG_WORD) === FLAG_WORD;
}

/**
 * Sorts the nodes in a trie in place.
 */
export function orderTrie(node: TrieNode) {
    if (!node.c) return;

    const nodes = [...node.c].sort(([a], [b]) => a < b ? -1 : 1);
    node.c = new Map(nodes);
    for (const n of node.c) {
        orderTrie(n[1]);
    }
}

/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function walk(node: TrieNode): Sequence<YieldResult> {
    return genSequence(walker(node));
}

export const iterateTrie = walk;

/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: TrieNode): Sequence<string> {
    return walk(node)
        .filter(r => isWordTerminationNode(r.node))
        .map(r => r.text);
}


export function createRoot(): TrieNode {
    return {};
}

export function createTriFromList(words: Iterable<string>): TrieNode {
    const root = createRoot();
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
    return root;
}
