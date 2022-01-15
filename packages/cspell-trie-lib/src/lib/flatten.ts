import { TrieNode } from './TrieNode';
import { TrieRefNode } from './trieRef';

export interface Emitter {
    push: (n: TrieRefNode) => number;
}

export function flattenToTrieRefNode(root: TrieNode, nodes: Emitter): number {
    const signatures = new Map<string, number>();
    const cached = new Set([0]); // The end of word is always a 0 and is always cached.

    function canCache(n: TrieRefNode) {
        if (!n.r) return true;

        for (const v of n.r) {
            if (!cached.has(v[1])) return false;
        }

        return true;
    }

    function convert(n: TrieNode): number {
        const r = copy(n);
        if (n.c) {
            const children = [...n.c].sort((a, b) => (a[0] < b[0] ? -1 : 1));
            r.r = children.map((c) => [c[0], convert(c[1])] as [string, number]);
        }

        if (!canCache(r)) {
            return nodes.push(r) - 1;
        }

        const sig = signature(r);
        const ref = signatures.get(sig);
        if (ref !== undefined) {
            cached.add(ref);
            return ref;
        }
        const idx = nodes.push(r) - 1;
        signatures.set(sig, idx);
        return idx;
    }

    return convert(root);
}

export function flattenToTrieRefNodeIterable(root: TrieNode): IterableIterator<TrieRefNode> {
    const signatures = new Map<string, number>();
    const cached = new Set([0]); // The end of word is always a 0 and is always cached.

    function canCache(n: TrieRefNode) {
        if (!n.r) return true;

        for (const v of n.r) {
            if (!cached.has(v[1])) return false;
        }

        return true;
    }

    function* convert(root: TrieNode): IterableIterator<TrieRefNode> {
        interface StackElement {
            k: string;
            n: TrieNode;
            p: TrieRefNode;
            r?: TrieRefNode;
        }
        const stack: StackElement[] = [];

        function addToStack(c: Map<string, TrieNode> | undefined, p: TrieRefNode) {
            if (!c) return;
            const children = [...c.entries()].map(([k, n]) => ({ k, n, p })).sort((a, b) => (a.k < b.k ? 1 : -1));
            stack.push(...children);
        }

        const r = copy(root);
        addToStack(root.c, r);

        let t: StackElement | undefined;
        let count = 0;

        function calcRef(r: TrieRefNode): { ref: number; emit: boolean } {
            if (!canCache(r)) {
                return { ref: count++, emit: true };
            }
            const sig = signature(r);
            const ref = signatures.get(sig);
            if (ref !== undefined) {
                cached.add(ref);
                return { ref, emit: false };
            }
            const idx = count++;
            signatures.set(sig, idx);
            return { ref: idx, emit: true };
        }

        while ((t = stack.pop())) {
            if (t.r) {
                // We are on the way out.
                const ref = calcRef(t.r);
                t.p.r = t.p.r || [];
                t.p.r.push([t.k, ref.ref]);
                if (ref.emit) {
                    yield t.r;
                }
            } else {
                // Going deeper
                t.r = copy(t.n);
                stack.push(t);
                addToStack(t.n.c, t.r);
            }
        }

        const ref = calcRef(r);
        if (ref.emit) {
            yield r;
        }
    }

    return convert(root);
}

export function flattenToTrieRefNodeArray(root: TrieNode): TrieRefNode[] {
    const nodes: TrieRefNode[] = [];
    flattenToTrieRefNode(root, nodes);
    return nodes;
}

function signature(n: TrieRefNode): string {
    const refs = n.r ? JSON.stringify(n.r) : '';
    const isWord = n.f ? '*' : '';
    return isWord + refs;
}

function copy(n: TrieNode): TrieRefNode {
    return n.f ? { f: n.f, r: undefined } : { f: undefined, r: undefined };
}
