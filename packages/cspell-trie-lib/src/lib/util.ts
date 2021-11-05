import { Sequence, genSequence } from 'gensequence';
import { TrieNode, FLAG_WORD, ChildMap, TrieRoot, PartialTrieOptions, TrieOptions } from './TrieNode';
import { YieldResult, walker } from './walker';
import { defaultTrieOptions } from './constants';

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

export function isWordTerminationNode(node: TrieNode): boolean {
    return ((node.f || 0) & FLAG_WORD) === FLAG_WORD;
}

/**
 * Sorts the nodes in a trie in place.
 */
export function orderTrie(node: TrieNode): void {
    if (!node.c) return;

    const nodes = [...node.c].sort(([a], [b]) => (a < b ? -1 : 1));
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
        .filter((r) => isWordTerminationNode(r.node))
        .map((r) => r.text);
}

export function mergeOptionalWithDefaults(options: PartialTrieOptions): TrieOptions {
    return mergeDefaults(options, defaultTrieOptions);
}

export function createTrieRoot(options: PartialTrieOptions): TrieRoot {
    const fullOptions = mergeOptionalWithDefaults(options);
    return {
        ...fullOptions,
        c: new Map<string, TrieNode>(),
    };
}

export function createTriFromList(words: Iterable<string>, options?: PartialTrieOptions): TrieRoot {
    const root = createTrieRoot(options);
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
    return root;
}

export function has(node: TrieNode, word: string): boolean {
    let h = word.slice(0, 1);
    let t = word.slice(1);
    while (node.c && node.c.has(h)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        node = node.c.get(h)!;
        h = t.slice(0, 1);
        t = t.slice(1);
    }

    return !h.length && !!((node.f || 0) & FLAG_WORD);
}

export function findNode(node: TrieNode, prefix: string): TrieNode | undefined {
    let h = prefix.slice(0, 1);
    let t = prefix.slice(1);
    let n: TrieNode | undefined = node;
    while (h.length && n && n.c) {
        n = n.c.get(h);
        h = t.slice(0, 1);
        t = t.slice(1);
    }
    return n;
}

export function countNodes(root: TrieNode): number {
    const seen = new Set<TrieNode>();

    function walk(n: TrieNode) {
        if (seen.has(n)) return;
        seen.add(n);
        if (n.c) {
            [...n.c.values()].forEach((n) => walk(n));
        }
    }

    walk(root);
    return seen.size;
}

export function countWords(root: TrieNode): number {
    const visited = new Map<TrieNode, number>();

    function walk(n: TrieNode) {
        if (visited.has(n)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return visited.get(n)!;
        }

        let cnt = n.f ? 1 : 0;
        // add the node to the set to avoid getting stuck on circular references.
        visited.set(n, cnt);

        if (!n.c) {
            return cnt;
        }

        for (const c of n.c.values()) {
            cnt += walk(c);
        }
        visited.set(n, cnt);
        return cnt;
    }

    return walk(root);
}

export function isCircular(root: TrieNode): boolean {
    const seen = new Set<TrieNode>();
    const inStack = new Set<TrieNode>();

    interface Reduce {
        isCircular: boolean;
        allSeen: boolean;
    }

    function walk(n: TrieNode): Reduce {
        if (seen.has(n)) return { isCircular: false, allSeen: true };
        if (inStack.has(n)) return { isCircular: true, allSeen: false };
        inStack.add(n);
        let r: Reduce = { isCircular: false, allSeen: true };
        if (n.c) {
            r = [...n.c.values()].reduce((acc: Reduce, n: TrieNode) => {
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

    return walk(root).isCircular;
}

/**
 * Creates a new object of type T based upon the field values from `value`.
 * n[k] = value[k] ?? default[k] where k must be a field in default.
 * Note: it will remove fields not in defaultValue!
 * @param value
 * @param defaultValue
 */
export function mergeDefaults<T>(value: Partial<T> | undefined, defaultValue: T): T {
    const result = { ...defaultValue };
    const allowedKeys = new Set(Object.keys(defaultValue));
    if (value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [k, v] of Object.entries(value) as [keyof T, any][]) {
            if (allowedKeys.has(k as string)) {
                result[k] = v ?? result[k];
            }
        }
    }
    return result;
}

export function trieNodeToRoot(node: TrieNode, options: PartialTrieOptions): TrieRoot {
    const newOptions = mergeOptionalWithDefaults(options);
    return {
        ...newOptions,
        c: node.c || new Map<string, TrieNode>(),
    };
}

/**
 * Normalize word unicode.
 * @param text - text to normalize
 * @returns returns a word normalized to `NFC`
 */
export const normalizeWord = (text: string): string => text.normalize();

/**
 * converts text to lower case and removes any accents.
 * @param text - text to convert
 * @returns lowercase word without accents
 * @deprecated true
 */
export const normalizeWordToLowercase = (text: string): string =>
    text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/**
 * generate case insensitive forms of a word
 * @param text - text to convert
 * @returns the forms of the word.
 */
export const normalizeWordForCaseInsensitive = (text: string): string[] => {
    const t = text.toLowerCase();
    return [t, t.normalize('NFD').replace(/\p{M}/gu, '')];
};

export function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined;
}
