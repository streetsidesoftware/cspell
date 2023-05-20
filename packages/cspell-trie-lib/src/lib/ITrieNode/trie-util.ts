import type { ITrieNode, ITrieNodeId } from './ITrieNode.js';
import { walker, walkerWords } from './walker/walker.js';
import type { YieldResult } from './walker/walkerTypes.js';

export function isWordTerminationNode(node: ITrieNode): boolean {
    return node.eow;
}

/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function walk(node: ITrieNode): Iterable<YieldResult> {
    return walker(node);
}

export const iterateTrie = walk;

/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: ITrieNode): Iterable<string> {
    return walkerWords(node);
}

export function has(node: ITrieNode, word: string): boolean {
    const n = findNode(node, word);
    return (n && n.eow) || false;
}

export function findNode(node: ITrieNode, word: string): ITrieNode | undefined {
    for (let i = 0; i < word.length; ++i) {
        const n = node.get(word[i]);
        if (!n) return undefined;
        node = n;
    }
    return node;
}

export function countNodes(root: ITrieNode): number {
    const seen = new Set<ITrieNodeId>();

    function walk(n: ITrieNode) {
        if (seen.has(n.id)) return;
        seen.add(n.id);
        for (let i = 0; i < n.size; ++i) {
            walk(n.child(i));
        }
    }

    walk(root);
    return seen.size;
}

export function countWords(root: ITrieNode): number {
    const visited = new Map<ITrieNodeId, number>();

    function walk(n: ITrieNode): number {
        const nestedCount = visited.get(n.id);
        if (nestedCount !== undefined) {
            return nestedCount;
        }

        let cnt = n.eow ? 1 : 0;
        // add the node to the set to avoid getting stuck on circular references.
        visited.set(n, cnt);

        const size = n.size;
        for (let i = 0; i < size; ++i) {
            cnt += walk(n.child(i));
        }
        visited.set(n, cnt);
        return cnt;
    }

    return walk(root);
}
