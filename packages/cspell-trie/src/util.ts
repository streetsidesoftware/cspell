import {Sequence, genSequence} from 'gensequence';
import {TrieNode, FLAG_WORD, ChildMap} from './trie';

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

export interface YieldResult {
    text: string;
    node: TrieNode;
    depth: number;
}


/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function iterateTrie(node: TrieNode): Sequence<YieldResult> {
    function* iterate(node: TrieNode, text: string, depth: number): IterableIterator<YieldResult> {
        const r = { node, text, depth };
        yield r;
        if (node.c) {
            for (const n of node.c) {
                const [t, c] = n;
                yield* iterate(c, text + t, depth + 1);
            }
        }
    }

    return genSequence(iterate(node, '', 0));
}

/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: TrieNode): Sequence<string> {
    return genSequence(iterateTrie(node))
        .filter(r => ((r.node.f || 0) & FLAG_WORD) === FLAG_WORD)
        .map(r => r.text);
}
