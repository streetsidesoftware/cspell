import type { ITrieNode } from '../ITrieNode.js';
import type { WalkerIterator } from './walkerTypes.js';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from './walkerTypes.js';

/**
 * Walks the Trie and yields a value at each node.
 * next(goDeeper: boolean):
 */
function* compoundWalker(root: ITrieNode, compoundingMethod: CompoundWordsMethod): WalkerIterator {
    type Children = Readonly<Array<readonly [string, ITrieNode]>>;
    const empty: Children = Object.freeze([] as Children);
    const roots: { [index: number]: Children } = {
        [CompoundWordsMethod.NONE]: empty,
        [CompoundWordsMethod.JOIN_WORDS]: [[JOIN_SEPARATOR, root]],
        [CompoundWordsMethod.SEPARATE_WORDS]: [[WORD_SEPARATOR, root]],
    };

    const rc = roots[compoundingMethod].length ? roots[compoundingMethod] : undefined;

    function children(n: ITrieNode): Children {
        if (n.hasChildren()) {
            const entries = n.entries();
            const c = Array.isArray(entries) ? entries : [...entries];
            return n.eow && rc ? [...c, ...rc] : c;
        }
        if (n.eow) {
            return roots[compoundingMethod];
        }
        return empty;
    }

    let depth = 0;
    const stack: { t: string; c: Children; ci: number }[] = [];
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
function* nodeWalker(root: ITrieNode): WalkerIterator {
    type Children = Readonly<Array<[string, ITrieNode]>>;

    let depth = 0;
    const stack: { t: string; n: ITrieNode; c: Children; ci: number }[] = [];
    const entries = root.entries();
    stack[depth] = { t: '', n: root, c: Array.isArray(entries) ? entries : [...entries], ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length && s.n) {
            const idx = s.ci++;
            const [char, node] = s.c[idx];
            const text = baseText + char;
            const goDeeper = yield { text, node, depth };
            if (goDeeper !== false) {
                depth++;
                baseText = text;
                const s = stack[depth];
                const entries = node.entries();
                const c = Array.isArray(entries) ? entries : [...entries];
                if (s) {
                    s.t = text;
                    s.n = node;
                    s.c = c;
                    s.ci = 0;
                } else {
                    stack[depth] = { t: text, n: node, c, ci: 0 };
                }
            }
            s = stack[depth];
        }
        depth -= 1;
    }
}

export function walker(
    root: ITrieNode,
    compoundingMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
): WalkerIterator {
    return compoundingMethod === CompoundWordsMethod.NONE ? nodeWalker(root) : compoundWalker(root, compoundingMethod);
}

export function walkerWords(root: ITrieNode): Iterable<string> {
    return walkerWordsITrie(root);
}

/**
 * Walks the Trie and yields each word.
 */
export function* walkerWordsITrie(root: ITrieNode): Iterable<string> {
    type Children = readonly [string, ITrieNode][];
    interface Stack {
        t: string;
        n: ITrieNode;
        c: Children;
        ci: number;
    }

    let depth = 0;
    const stack: Stack[] = [];
    const entries = root.entries();
    const c = Array.isArray(entries) ? entries : [...entries];
    stack[depth] = { t: '', n: root, c, ci: 0 };
    while (depth >= 0) {
        let s = stack[depth];
        let baseText = s.t;
        while (s.ci < s.c.length && s.n) {
            const [char, node] = s.c[s.ci++];
            if (!node) continue;
            const text = baseText + char;
            if (node.eow) yield text;
            depth++;
            baseText = text;
            const entries = node.entries();
            const c = Array.isArray(entries) ? entries : [...entries];
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
