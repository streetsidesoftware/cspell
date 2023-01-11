import { consolidate } from './consolidate';
import type { PartialTrieOptions, TrieOptions } from './trie';
import { Trie } from './trie';
import { createTrieRoot, createTriFromList, mergeOptionalWithDefaults, trieNodeToRoot } from './trie-util';
import type { TrieNode, TrieRoot } from './TrieNode';
import { SecondChanceCache } from './utils/secondChanceCache';

/**
 * Builds an optimized Trie from a Iterable<string>. It attempts to reduce the size of the trie
 * by finding common endings.
 * @param words Iterable set of words -- no processing is done on the words, they are inserted as is.
 * @param trieOptions options for the Trie
 */
export function buildTrie(words: Iterable<string>, trieOptions?: PartialTrieOptions): Trie {
    return new TrieBuilder(words, trieOptions).build();
}

/**
 * Builds a Trie from a Iterable<string>. NO attempt a reducing the size of the Trie is done.
 * @param words Iterable set of words -- no processing is done on the words, they are inserted as is.
 * @param trieOptions options for the Trie
 */
export function buildTrieFast(words: Iterable<string>, trieOptions?: PartialTrieOptions): Trie {
    const root = createTriFromList(words, trieOptions);
    return new Trie(root, undefined);
}

interface PathNode {
    /** a single character */
    s: string;
    /** the corresponding child node after adding s */
    n: TrieNode;
}

// cspell:words sigs
const MAX_NUM_SIGS = 100000;
const MAX_TRANSFORMS = 1000000;
const MAX_CACHE_SIZE = 1000000;

export class TrieBuilder {
    private count = 0;
    private readonly signatures = new SecondChanceCache<string, TrieNode>(MAX_NUM_SIGS);
    private readonly cached = new SecondChanceCache<TrieNode, number>(MAX_CACHE_SIZE);
    private readonly transforms = new SecondChanceCache<TrieNode, Map<string, TrieNode>>(MAX_TRANSFORMS);
    private _eow: TrieNode = Object.freeze({ f: 1 });
    /** position 0 of lastPath is always the root */
    private lastPath: PathNode[] = [{ s: '', n: { f: undefined, c: undefined } }];
    private tails = new Map([['', this._eow]]);
    public trieOptions: TrieOptions;

    constructor(words?: Iterable<string>, trieOptions?: PartialTrieOptions) {
        this._canBeCached(this._eow); // this line is just for coverage reasons
        this.signatures.set(this.signature(this._eow), this._eow);
        this.cached.set(this._eow, this.count++);
        this.trieOptions = Object.freeze(mergeOptionalWithDefaults(trieOptions));

        if (words) {
            this.insert(words);
        }
    }

    private set _root(n: TrieRoot) {
        this.lastPath[0].n = n;
    }

    private get _root(): TrieRoot {
        return trieNodeToRoot(this.lastPath[0].n, this.trieOptions);
    }

    private signature(n: TrieNode): string {
        const isWord = n.f ? '*' : '';
        const ref = n.c ? JSON.stringify([...n.c.entries()].map(([k, n]) => [k, this.cached.get(n)])) : '';
        return isWord + ref;
    }

    private _canBeCached(n: TrieNode): boolean {
        if (!n.c) return true;
        for (const v of n.c) {
            if (!this.cached.has(v[1])) return false;
        }
        return true;
    }

    private tryCacheFrozen(n: TrieNode) {
        if (this.cached.has(n)) {
            return n;
        }
        this.cached.set(n, this.count++);
        return n;
    }

    private freeze(n: TrieNode) {
        if (Object.isFrozen(n)) return n;
        // istanbul ignore else
        if (n.c) {
            const c = [...n.c]
                .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                .map(([k, n]) => [k, this.freeze(n)] as [string, TrieNode]);
            n.c = new Map(c);
            Object.freeze(n.c);
        }
        return Object.freeze(n);
    }

    private tryToCache(n: TrieNode): TrieNode {
        if (!this._canBeCached(n)) {
            return n;
        }
        const sig = this.signature(n);
        const ref = this.signatures.get(sig);
        if (ref !== undefined) {
            return this.tryCacheFrozen(ref);
        }
        this.signatures.set(sig, this.freeze(n));
        return n;
    }

    private storeTransform(src: TrieNode, s: string, result: TrieNode) {
        if (!Object.isFrozen(result) || !Object.isFrozen(src)) return;
        const t = this.transforms.get(src) ?? new Map<string, TrieNode>();
        t.set(s, result);
        this.transforms.set(src, t);
    }

    private addChild(node: TrieNode, head: string, child: TrieNode): TrieNode {
        if (node.c?.get(head) !== child) {
            if (!node.c || Object.isFrozen(node)) {
                node = { ...node, c: new Map(node.c ?? []) };
            }
            node.c?.set(head, child);
        }
        return Object.isFrozen(child) ? this.tryToCache(node) : node;
    }

    private buildTail(s: string): TrieNode {
        const v = this.tails.get(s);
        if (v) return v;
        const head = s[0];
        const tail = s.slice(1);
        const t = this.tails.get(tail);
        const c = t || this.buildTail(tail);
        const n = this.addChild({ f: undefined, c: undefined }, head, c);
        if (!t) {
            return n;
        }
        const cachedNode = this.tryCacheFrozen(Object.freeze(n));
        this.tails.set(s, cachedNode);
        return cachedNode;
    }

    private _insert(node: TrieNode, s: string, d: number): TrieNode {
        const orig = node;
        if (Object.isFrozen(node)) {
            const n = this.transforms.get(node)?.get(s);
            if (n) {
                return this.tryCacheFrozen(n);
            }
        }
        if (!s) {
            if (!node.c) {
                return this._eow;
            } else {
                node = copyIfFrozen(node);
                node.f = this._eow.f;
                return node;
            }
        }
        const head = s[0];
        const tail = s.slice(1);
        const cNode = node.c?.get(head);
        const child = cNode ? this._insert(cNode, tail, d + 1) : this.buildTail(tail);
        node = this.addChild(node, head, child);
        this.storeTransform(orig, s, node);
        this.lastPath[d] = { s: head, n: child };
        return node;
    }

    insertWord(word: string): void {
        let d = 1;
        for (const s of word.split('')) {
            const p = this.lastPath[d];
            if (p?.s !== s) break;
            d++;
        }

        // remove the remaining part of the path because it doesn't match this word.
        if (word.length < d) {
            d = word.length;
        }
        this.lastPath.length = d;
        d -= 1;
        const { n } = this.lastPath[d];
        const tail = word.slice(d);
        this.lastPath[d].n = this._insert(n, tail, d + 1);
        while (d > 0) {
            const { s, n } = this.lastPath[d];
            d -= 1;
            const parent = this.lastPath[d];
            const pn = parent.n;
            parent.n = this.addChild(pn, s, n);
            if (pn === parent.n) break;
            const tail = word.slice(d);
            this.storeTransform(pn, tail, parent.n);
        }
    }

    insert(words: Iterable<string>): void {
        for (const w of words) {
            w && this.insertWord(w);
        }
    }

    /**
     * Resets the builder
     */
    reset(): void {
        this._root = createTrieRoot(this.trieOptions);
        this.cached.clear();
        this.signatures.clear();
        this.signatures.set(this.signature(this._eow), this._eow);
        this.count = 0;
        this.cached.set(this._eow, this.count++);
    }

    build(consolidateSuffixes = false): Trie {
        const root = this._root;
        // Reset the builder to prevent updating the trie in the background.
        this.reset();
        return new Trie(consolidateSuffixes ? consolidate(root) : root);
    }
}

function copyIfFrozen(n: TrieNode): TrieNode {
    if (!Object.isFrozen(n)) return n;
    const c = n.c ? new Map(n.c) : undefined;
    return { f: n.f, c };
}
