import type { ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.js';
import { isValidChar } from '../utils/isValidChar.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { walker, walkerWords } from '../walker/walker.js';
import type { YieldResult } from '../walker/walkerTypes.js';
import { trieRootToITrieRoot } from './trie.js';
import type { TrieNode, TrieRoot } from './TrieNode.js';
import { FLAG_WORD } from './TrieNode.js';

export function insert(word: string, root: TrieNode = {}): TrieNode {
    // spread is necessary to handle surrogates.
    const text = [...word];
    let node = root;
    for (let i = 0; i < text.length; ++i) {
        const head = text[i];
        const c = node.c || Object.create(null);
        node.c = c;
        node = c[head] || {};
        c[head] = node;
    }
    node.f = (node.f || 0) | FLAG_WORD;
    return root;
}

export function isWordTerminationNode(node: TrieNode): boolean {
    return ((node.f || 0) & FLAG_WORD) === FLAG_WORD;
}

/**
 * Sorts the nodes in a trie in place.
 */
export function orderTrie(node: TrieNode): void {
    if (!node.c) return;

    const nodes = Object.entries(node.c).sort(([a], [b]) => (a < b ? -1 : 1));
    node.c = Object.fromEntries(nodes);
    for (const n of nodes) {
        orderTrie(n[1]);
    }
}

/**
 * Generator an iterator that will walk the Trie parent then children in a depth first fashion that preserves sorted order.
 */
export function walk(node: TrieNode): Iterable<YieldResult> {
    return walker(node);
}

export const iterateTrie = walk;

/**
 * Generate a Iterator that can walk a Trie and yield the words.
 */
export function iteratorTrieWords(node: TrieNode): Iterable<string> {
    return walkerWords(node);
}

export function createTrieRoot(options: PartialTrieInfo): TrieRoot {
    const fullOptions = mergeOptionalWithDefaults(options);
    return {
        ...fullOptions,
        c: Object.create(null),
    };
}

export function createTrieRootFromList(words: Iterable<string>, options?: PartialTrieInfo): TrieRoot {
    const root = createTrieRoot(options);
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
    return root;
}

export function createITrieFromList(words: Iterable<string>, options?: PartialTrieInfo): ITrieNodeRoot {
    return trieRootToITrieRoot(createTrieRootFromList(words, options));
}

export function has(node: TrieNode, word: string): boolean {
    let h = word.slice(0, 1);
    let t = word.slice(1);
    while (node.c && h in node.c) {
        node = node.c[h];
        h = t.slice(0, 1);
        t = t.slice(1);
    }

    return !h.length && !!((node.f || 0) & FLAG_WORD);
}

export function findNode(node: TrieNode, word: string): TrieNode | undefined {
    for (let i = 0; i < word.length; ++i) {
        const n = node.c?.[word[i]];
        if (!n) return undefined;
        node = n;
    }
    return node;
}

export function countNodes(root: TrieNode): number {
    const seen = new Set<TrieNode>();

    function walk(n: TrieNode) {
        if (seen.has(n)) return;
        seen.add(n);
        if (n.c) {
            Object.values(n.c).forEach((n) => walk(n));
        }
    }

    walk(root);
    return seen.size;
}

export function countWords(root: TrieNode): number {
    const visited = new Map<TrieNode, number>();

    function walk(n: TrieNode) {
        if (visited.has(n)) {
            return visited.get(n)!;
        }

        let cnt = n.f ? 1 : 0;
        // add the node to the set to avoid getting stuck on circular references.
        visited.set(n, cnt);

        if (!n.c) {
            return cnt;
        }

        for (const c of Object.values(n.c)) {
            cnt += walk(c);
        }
        visited.set(n, cnt);
        return cnt;
    }

    return walk(root);
}

interface CircularRef {
    stack: TrieNode[];
    word: string;
    pos: number;
}
interface CircularCheckTrue {
    isCircular: true;
    allSeen: boolean;
    ref: CircularRef;
}

interface CircularCheckFalse {
    isCircular: false;
    allSeen: boolean;
    ref?: CircularRef;
}

type CircularCheck = CircularCheckTrue | CircularCheckFalse;

export function checkCircular(root: TrieNode): CircularCheck {
    const seen = new Set<TrieNode>();
    const inStack = new Set<TrieNode>();

    function walk(n: TrieNode): CircularCheck {
        if (seen.has(n)) return { isCircular: false, allSeen: true };
        if (inStack.has(n)) {
            const stack = [...inStack, n];
            const word = trieStackToWord(stack);
            const pos = stack.indexOf(n);
            return { isCircular: true, allSeen: false, ref: { stack, word, pos } };
        }
        inStack.add(n);
        let r: CircularCheck = { isCircular: false, allSeen: true };
        if (n.c) {
            r = Object.values(n.c).reduce((acc: CircularCheck, n: TrieNode) => {
                if (acc.isCircular) return acc;
                const r = walk(n);
                r.allSeen = r.allSeen && acc.allSeen;
                return r;
            }, r);
        }
        if (r.allSeen) {
            seen.add(n);
        }
        inStack.delete(n);
        return r;
    }

    return walk(root);
}

function reverseMapTrieNode(node: TrieNode): undefined | Map<TrieNode, string> {
    return node.c && new Map(Object.entries(node.c).map(([c, n]) => [n, c]));
}

function trieStackToWord(stack: TrieNode[]): string {
    let word = '';

    let lastMap = reverseMapTrieNode(stack[0]);
    for (let i = 1; i < stack.length; ++i) {
        const n = stack[i];
        const char = lastMap?.get(n);
        if (char) {
            word += char;
        }
        lastMap = reverseMapTrieNode(n);
    }

    return word;
}

export function isCircular(root: TrieNode): boolean {
    return checkCircular(root).isCircular;
}

export function trieNodeToRoot(node: TrieNode, options: PartialTrieInfo): TrieRoot {
    const newOptions = mergeOptionalWithDefaults(options);
    return {
        ...newOptions,
        c: node.c || Object.create(null),
    };
}

export interface ValidateTrieResult {
    root: TrieNode;
    isValid: boolean;
    node?: TrieNode;
    error?: string;
}

export function validateTrie(root: TrieNode): ValidateTrieResult {
    if (checkCircular(root).isCircular) return { root, isValid: false, error: 'Circular Reference' };

    const result: ValidateTrieResult = { root, isValid: true };

    function walk(n: TrieNode): boolean {
        if (!n.c) return true;
        if (Object.keys(n.c).some((c) => !isValidChar(c))) {
            const c = Object.keys(n.c).find((c) => !isValidChar(c));
            result.error = `Invalid character "${c}" in trie node`;
            result.node = n;
            return false;
        }
        return Object.values(n.c).every(walk);
    }

    result.isValid = walk(root);
    return result;
}
