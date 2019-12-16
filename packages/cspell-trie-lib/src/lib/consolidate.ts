import { TrieNode } from './TrieNode';
/**
 * Consolidate to DAWG
 * @param root the root of the Trie tree
 */
export function consolidate(root: TrieNode, iterations = 5): TrieNode {
    let count: number = 0;
    const signatures = new Map<string, TrieNode>();
    const cached = new Map<TrieNode, number>();

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

    function convert(n: TrieNode): TrieNode {
        if (cached.has(n)) {
            return n;
        }
        if (n.c) {
            const children = [...n.c].sort((a, b) => a[0] < b[0] ? -1 : 1);
            n.c.clear();
            n.c = new Map(children.map(c => [c[0], convert(c[1])]));
        }
        if (!canCache(n)) {
            return n;
        }
        const sig = signature(n);
        const ref = signatures.get(sig);
        if (ref !== undefined) {
            if (!cached.has(ref) && ref !== n) {
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
