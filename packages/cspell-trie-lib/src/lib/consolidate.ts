import { TrieNode } from './TrieNode';

/**
 * Consolidate to DAWG
 * @param root the root of the Trie tree
 */
export function consolidate(root: TrieNode, iterations = 5): TrieNode {
    let count: number = 0;
    const signatures = new Map<string, TrieNode>();
    const cached = new Map<TrieNode, number>();
    const knownMap = new Map<TrieNode, TrieNode>();

    function signature(n: TrieNode): string {
        const isWord = n.f ? '*' : '';
        const ref = n.c
            ? JSON.stringify([...n.c.entries()].map(([k, n]) => [k, cached.get(n)]))
            : '';
        return isWord + ref;
    }

    function canCache(n: TrieNode) {
        if (!n.c)
            return true;
        for (const v of n.c) {
            if (!cached.has(v[1]))
                return false;
        }
        return true;
    }

    function deepConvert(n: TrieNode): TrieNode {
        if (knownMap.has(n)) {
            return knownMap.get(n)!;
        }
        const orig = n;
        n = Object.isFrozen(n) ? {...n, c: n.c && new Map(n.c)} : n;
        if (n.c) {
            const children = [...n.c].sort((a, b) => a[0] < b[0] ? -1 : 1);
            n.c = new Map(children.map(c => [c[0], deepConvert(c[1])]));
        }
        const sig = signature(n);
        const ref = signatures.get(sig);
        if (ref) {
            knownMap.set(orig, ref);
            if (!cached.has(ref)) {
                cached.set(ref, count++);
            }
            return ref;
        }
        Object.freeze(n);
        signatures.set(sig, n);
        cached.set(n, count++);
        knownMap.set(orig, n);
        return n;
    }

    function convert(n: TrieNode): TrieNode {
        if (cached.has(n)) {
            return n;
        }
        if (Object.isFrozen(n)) {
            return knownMap.get(n) || deepConvert(n);
        }
        if (n.c) {
            const children = [...n.c].sort((a, b) => a[0] < b[0] ? -1 : 1);
            n.c = new Map(children.map(c => [c[0], convert(c[1])]));
        }
        if (!canCache(n)) {
            return n;
        }
        const sig = signature(n);
        const ref = signatures.get(sig);
        if (ref) {
            if (!cached.has(ref)) {
                cached.set(ref, count++);
            }
            return ref;
        }
        signatures.set(sig, n);
        return n;
    }

    // Add end of word to the set of signatures and cache it.
    const eow = { f: 1 };
    signatures.set(signature(eow), eow);
    cached.set(eow, count++);

    for (let i = 0; i < iterations; ++i) {
        const n = cached.size;
        root = convert(root);
        if (n === cached.size) break;
    }
    return root;
}
