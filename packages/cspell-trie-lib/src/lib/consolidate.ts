import { TrieNode, FLAG_WORD, TrieRoot } from './TrieNode';
import { trieNodeToRoot } from './trie-util';

/**
 * Consolidate to DAWG
 * @param root the root of the Trie tree
 */
export function consolidate(root: TrieRoot): TrieRoot {
    let count = 0;
    const signatures = new Map<string, TrieNode>();
    const cached = new Map<TrieNode, number>();
    const knownMap = new Map<TrieNode, TrieNode>();

    function signature(n: TrieNode): string {
        const isWord = n.f ? '*' : '';
        const ref = n.c ? JSON.stringify([...n.c.entries()].map(([k, n]) => [k, cached.get(n)])) : '';
        return isWord + ref;
    }

    function findEow(n: TrieNode): TrieNode | undefined {
        if (n.f && !n.c) return n;
        let r: TrieNode | undefined;
        // istanbul ignore else
        if (n.c) {
            for (const c of n.c.values()) {
                r = findEow(c);
                // istanbul ignore else
                if (r) break;
            }
        }
        return r;
    }

    function compareMaps(a: [string, TrieNode][], b: Map<string, TrieNode>): boolean {
        for (const e of a) {
            if (b.get(e[0]) !== e[1]) return false;
        }
        return a.length === b.size;
    }

    function deepCopy(n: TrieNode): TrieNode {
        const k = knownMap.get(n);
        if (k) {
            return k;
        }

        const orig = n;
        if (n.c) {
            const children = [...n.c].map((c) => [c[0], deepCopy(c[1])] as [string, TrieNode]);
            if (!compareMaps(children, n.c)) {
                n = { f: n.f, c: new Map(children) };
            }
        }
        const sig = signature(n);
        const ref = signatures.get(sig);
        if (ref) {
            knownMap.set(orig, ref);
            return ref;
        }
        Object.freeze(n);
        signatures.set(sig, n);
        cached.set(n, count++);
        knownMap.set(orig, n);
        return n;
    }

    function process(n: TrieNode): TrieNode {
        if (cached.has(n)) {
            return n;
        }
        if (Object.isFrozen(n)) {
            return knownMap.get(n) || deepCopy(n);
        }
        if (n.c) {
            const children = [...n.c]
                .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                .map((c) => [c[0], process(c[1])] as [string, TrieNode]);
            n.c = new Map(children);
        }
        const sig = signature(n);
        const ref = signatures.get(sig);
        if (ref) {
            return ref;
        }
        signatures.set(sig, n);
        cached.set(n, count++);
        return n;
    }

    // Add end of word to the set of signatures and cache it.
    const eow = findEow(root) || { f: FLAG_WORD, c: undefined };
    signatures.set(signature(eow), eow);
    cached.set(eow, count++);
    return trieNodeToRoot(process(root), root);
}
