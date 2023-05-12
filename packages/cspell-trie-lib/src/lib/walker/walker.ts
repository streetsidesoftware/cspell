import type { ITrieNode } from '../TrieNode/ITrieNode.js';
import { trieNodeToITrieNode } from '../TrieNode/trie.js';
import type { TrieNode } from '../TrieNode/TrieNode.js';
import type { WalkerIterator } from './walkerTypes.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from './walkerTypes.js';

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
function* compoundWalker(root: TrieNode, compoundingMethod: CompoundWordsMethod): WalkerIterator {
    type Children = Array<[string, TrieNode]>;
    const roots: { [index: number]: Children } = {
        [CompoundWordsMethod.NONE]: [],
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };

    const rc = roots[compoundingMethod].length ? roots[compoundingMethod] : undefined;
    const empty: Children = [];

    function children(n: TrieNode): Children {
        if (n.c && n.f && rc) {
            return Object.entries(n.c).concat(rc);
        }
        if (n.c) {
            return Object.entries(n.c);
        }
        if (n.f && rc) {
            return rc;
        }
        return empty;
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

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
function* nodeWalker(root: TrieNode): WalkerIterator {
    type Children = Array<string>;
    const empty: Children = [];
    function children(n: TrieNode): string[] {
        if (n.c) {
            return Object.keys(n.c);
        }
        return empty;
    }

    let depth = 0;
    const stack: { t: string; n: Record<string, TrieNode> | undefined; c: Children; ci: number }[] = [];
    stack[depth] = { t: '', n: root.c, c: children(root), ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length && s.n) {
            const char = s.c[s.ci++];
            const node = s.n[char];
            const text = baseText + char;
            const goDeeper = yield { text, node, depth };
            if (goDeeper !== false) {
                depth++;
                baseText = text;
                const s = stack[depth];
                const c = children(node);
                if (s) {
                    s.t = text;
                    s.n = node.c;
                    s.c = c;
                    s.ci = 0;
                } else {
                    stack[depth] = { t: text, n: node.c, c, ci: 0 };
                }
            }
            s = stack[depth];
        }
        depth -= 1;
    }
}

const useITrie = false;
export const walkerWords = useITrie ? _walkerWords2 : _walkerWords;

/**
 * Walks the Trie and yields each word.
 */
function* _walkerWords(root: TrieNode): Iterable<string> {
    type Children = Array<string>;
    const empty: Children = [];
    function children(n: TrieNode): string[] {
        if (n.c) {
            return Object.keys(n.c);
        }
        return empty;
    }

    let depth = 0;
    const stack: { t: string; n: Record<string, TrieNode> | undefined; c: Children; ci: number }[] = [];
    stack[depth] = { t: '', n: root.c, c: children(root), ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length && s.n) {
            const char = s.c[s.ci++];
            const node = s.n[char];
            const text = baseText + char;
            if (node.f) yield text;
            depth++;
            baseText = text;
            const c = children(node);
            if (stack[depth]) {
                s = stack[depth];
                s.t = text;
                s.n = node.c;
                s.c = c;
                s.ci = 0;
            } else {
                stack[depth] = { t: text, n: node.c, c, ci: 0 };
            }
            s = stack[depth];
        }
        depth -= 1;
    }
}

export function walker(
    root: TrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE
): WalkerIterator {
    return compoundingMethod === CompoundWordsMethod.NONE ? nodeWalker(root) : compoundWalker(root, compoundingMethod);
}

function _walkerWords2(root: TrieNode): Iterable<string> {
    return walkerWordsITrie(trieNodeToITrieNode(root));
}

/**
 * Walks the Trie and yields each word.
 */
export function* walkerWordsITrie(root: ITrieNode): Iterable<string> {
    type Children = readonly string[];
    interface Stack {
        t: string;
        n: ITrieNode;
        c: Children;
        ci: number;
    }

    let depth = 0;
    const stack: Stack[] = [];
    stack[depth] = { t: '', n: root, c: root.getKeys(), ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length && s.n) {
            const char = s.c[s.ci++];
            const node = s.n.get(char);
            if (!node) continue;
            const text = baseText + char;
            if (node.eow) yield text;
            depth++;
            baseText = text;
            const c = node.getKeys();
            if (stack[depth]) {
                s = stack[depth];
                s.t = text;
                s.n = node;
                s.c = c;
                s.ci = 0;
            } else {
                stack[depth] = { t: text, n: node, c, ci: 0 };
            }
            s = stack[depth];
        }
        depth -= 1;
    }
}
