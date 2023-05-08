import type { TrieNode } from '../TrieNode.js';
import type { WalkerIterator } from './walkerTypes.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from './walkerTypes.js';

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
export function* walker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE
): WalkerIterator {
    const roots: { [index: number]: [string, TrieNode][] } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };

    function children(n: TrieNode): Array<[string, TrieNode]> {
        if (n.c && n.f) {
            return Object.entries(n.c).concat(roots[compoundingMethod]);
        }
        if (n.c) {
            return Object.entries(n.c);
        }
        if (n.f) {
            return roots[compoundingMethod];
        }
        return [];
    }

    let depth = 0;
    const stack: { t: string; c: Array<[string, TrieNode]>; ci: number }[] = [];
    stack[depth] = { t: '', c: children(root), ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length) {
            const [char, node] = s.c[s.ci++];
            const text = baseText + char;
            const goDeeper = yield { text, node, depth };
            if (goDeeper ?? true) {
                depth++;
                baseText = text;
                stack[depth] = { t: text, c: children(node), ci: 0 };
            }
            s = stack[depth];
        }
        depth -= 1;
    }
}
