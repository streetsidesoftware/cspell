import { consolidate } from './consolidate.js';
import type { PartialTrieOptions, TrieOptions } from './trie.js';
import { Trie } from './trie.js';
import { checkCircular, createTrieRootFromList, trieNodeToRoot } from './TrieNode/trie-util.js';
import type { TrieNode, TrieRoot } from './TrieNode/TrieNode.js';
import { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.js';
import { SecondChanceCache } from './utils/secondChanceCache.js';

type ChildMap = Record<string, TrieNodeEx>;

interface TrieNodeEx extends TrieNode {
    id: number;
    c?: ChildMap | undefined;
}

const SymbolFrozenNode = Symbol();

interface TrieNodeExFrozen extends TrieNodeEx {
    [SymbolFrozenNode]?: true;
    c?: Record<string, TrieNodeExFrozen> | undefined;
}

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
    const root = createTrieRootFromList(words, trieOptions);
    return new Trie(root, undefined);
}

interface PathNode {
    /** a single character */
    s: string;
    /** the corresponding child node after adding s */
    n: TrieNodeEx;
}

// cspell:words sigs
const MAX_NUM_SIGS = 100_000;
const MAX_TRANSFORMS = 1_000_000;
const MAX_CACHE_SIZE = 1_000_000;

export class TrieBuilder {
    private count = 0;
    private readonly signatures = new SecondChanceCache<string, TrieNodeEx>(MAX_NUM_SIGS);
    private readonly cached = new SecondChanceCache<TrieNodeEx, number>(MAX_CACHE_SIZE);
    private readonly transforms = new SecondChanceCache<TrieNodeEx, Map<string, TrieNodeEx>>(MAX_TRANSFORMS);
    private _eow: TrieNodeEx;
    /** position 0 of lastPath is always the root */
    private lastPath: PathNode[] = [{ s: '', n: { id: 0, f: undefined, c: undefined } }];
    private tails = new Map<string, TrieNodeEx>();
    public trieOptions: TrieOptions;
    private numWords = 0;
    private _debug_lastWordsInserted: string[] = [];
    // private _debug_mode = true;
    private _debug_mode = false;

    constructor(words?: Iterable<string>, trieOptions?: PartialTrieOptions) {
        this._eow = this.createNodeFrozen(1);
        this.tails.set('', this._eow);
        this._canBeCached(this._eow); // this line is just for coverage reasons
        this.signatures.set(this.signature(this._eow), this._eow);
        this.cached.set(this._eow, this._eow.id ?? ++this.count);
        this.trieOptions = Object.freeze(mergeOptionalWithDefaults(trieOptions));

        if (words) {
            this.insert(words);
        }
    }

    private get _root(): TrieRoot {
        return trieNodeToRoot(this.lastPath[0].n, this.trieOptions);
    }

    private signature(n: TrieNodeEx): string {
        const isWord = n.f ? '*' : '';
        const entries = n.c ? Object.entries(n.c) : undefined;
        const c = entries ? entries.map(([k, n]) => [k, this.cached.get(n)]) : undefined;
        const ref = c ? JSON.stringify(c) : '';
        const sig = isWord + ref;
        return sig;
    }

    private _canBeCached(n: TrieNodeEx): boolean {
        if (!n.c) return true;
        for (const v of Object.values(n.c)) {
            if (!this.cached.has(v)) return false;
        }
        return true;
    }

    private tryCacheFrozen(n: TrieNodeEx) {
        assertFrozen(n);
        if (this.cached.has(n)) {
            return n;
        }
        this.cached.set(n, n.id ?? ++this.count);
        return n;
    }

    private freeze(n: TrieNodeEx): TrieNodeExFrozen {
        if (Object.isFrozen(n)) return n;
        // istanbul ignore else
        if (n.c) {
            const c = Object.entries(n.c)
                .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                .map(([k, n]) => [k, this.freeze(n)] as [string, TrieNodeExFrozen]);
            n.c = Object.fromEntries(c);
            Object.freeze(n.c);
        }
        return Object.freeze(n);
    }

    private tryToCache(n: TrieNodeEx): TrieNodeEx {
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

    private storeTransform(src: TrieNodeEx, s: string, result: TrieNodeEx) {
        if (!Object.isFrozen(result) || !Object.isFrozen(src)) return;
        this.logDebug('storeTransform', () => ({ s, src: this.debNodeInfo(src), result: this.debNodeInfo(result) }));
        const t = this.transforms.get(src) ?? new Map<string, TrieNodeEx>();
        t.set(s, result);
        this.transforms.set(src, t);
    }

    private addChild(node: TrieNodeEx, head: string, child: TrieNodeEx): TrieNodeEx {
        if (node.c?.[head] !== child) {
            let c = node.c || Object.create(null);
            if (Object.isFrozen(c)) {
                c = Object.assign(Object.create(null), c);
            }
            c[head] = child;
            if (Object.isFrozen(node)) {
                node = this.createNode(node.f, c);
            } else {
                node.c = c;
            }
        }
        return Object.isFrozen(child) ? this.tryToCache(node) : node;
    }

    private buildTail(s: string): TrieNodeEx {
        const v = this.tails.get(s);
        if (v) return v;
        const head = s[0];
        const tail = s.slice(1);
        const t = this.tails.get(tail);
        const c = t || this.buildTail(tail);
        const n = this.addChild(this.createNode(), head, c);
        if (!t) {
            return n;
        }
        const cachedNode = this.tryCacheFrozen(this.freeze(n));
        this.tails.set(s, cachedNode);
        // console.warn('tail: %s', s);
        return cachedNode;
    }

    private _insert(node: TrieNodeEx, s: string, d: number): TrieNodeEx {
        this.logDebug('_insert', () => ({
            n: this.debNodeInfo(node),
            s,
            d,
            w: this.lastPath.map((a) => a.s).join(''),
        }));
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
                node = this.copyIfFrozen(node);
                node.f = this._eow.f;
                return node;
            }
        }
        const head = s[0];
        const tail = s.slice(1);
        const cNode = node.c?.[head];
        const child = cNode ? this._insert(cNode, tail, d + 1) : this.buildTail(tail);
        node = this.addChild(node, head, child);
        this.storeTransform(orig, s, node);
        this.lastPath[d] = { s: head, n: child };
        return node;
    }

    insertWord(word: string): void {
        // this._debug_mode ||= this.numWords >= 26123525;
        this.logDebug('insertWord', word);
        this._debug_lastWordsInserted[this.numWords & 0xf] = word;
        this.numWords++;
        // if (!(this.numWords % 100000) /*|| this.numWords > 26123530 */) {
        //     console.warn('check circular at: %o', this.numWords);
        //     const check = checkCircular(this._root);
        //     if (check.isCircular) {
        //         const prevWord = this.lastPath.map((a) => a.s).join('|');
        //         const prevWords = this._debug_lastWordsInserted.map(
        //             (w, i) => this._debug_lastWordsInserted[(this.numWords + i) & 0xf],
        //         );
        //         const { word, pos, stack } = check.ref;
        //         console.error('Circular before %o\ncheck: %o', this.numWords, { word, pos, prevWord, prevWords });
        //         console.error('Stack: %o', this.debugStack(stack));
        //         throw new Error('Circular');
        //     }
        // }

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
        this.lastPath = [{ s: '', n: { id: 0, f: undefined, c: undefined } }];
        this.cached.clear();
        this.signatures.clear();
        this.signatures.set(this.signature(this._eow), this._eow);
        this.count = 0;
        this.cached.set(this._eow, this._eow.id ?? ++this.count);
    }

    build(consolidateSuffixes = false): Trie {
        const root = this._root;
        // Reset the builder to prevent updating the trie in the background.
        this.reset();
        const check = checkCircular(this._root);

        if (check.isCircular) {
            const { word, pos } = check.ref;
            console.error('Circular Reference %o', { word, pos });
            throw new Error('Trie: Circular Reference');
        }

        return new Trie(consolidateSuffixes ? consolidate(root) : root);
    }

    private debugStack(stack: TrieNodeEx[]) {
        return stack.map((n) => this.debNodeInfo(n));
    }

    private debNodeInfo(node: TrieNodeEx) {
        const id = node.id ?? '?';
        const cid = this.cached.get(node) ?? '?';
        const f = node.f || 0;
        const c = node.c
            ? Object.fromEntries(
                  Object.entries(node.c).map(([k, n]) => [k, { id: (<TrieNodeEx>n).id, r: this.cached.get(n) }]),
              )
            : undefined;
        const L = Object.isFrozen(node);
        return { id, cid, f, c, L };
    }

    private logDebug(methodName: string, contentOrFunction: unknown | (() => void)) {
        this.runDebug(() => {
            const content = typeof contentOrFunction === 'function' ? contentOrFunction() : contentOrFunction;
            console.warn('%s: %o', methodName, content);
        });
    }

    private runDebug(method: () => void) {
        if (this._debug_mode) {
            method();
        }
    }

    private copyIfFrozen(n: TrieNodeEx): TrieNodeEx {
        if (!Object.isFrozen(n)) return n;
        const c = n.c ? Object.assign(Object.create(null), n.c) : undefined;
        return this.createNode(n.f, c);
    }

    private createNodeFrozen(f?: number | undefined, c?: ChildMap | undefined): TrieNodeExFrozen {
        return this.freeze(this.createNode(f, c));
    }

    private createNode(f?: number | undefined, c?: ChildMap | undefined): TrieNodeEx {
        return { id: ++this.count, f, c };
    }
}

function assertFrozen(n: TrieNodeEx): asserts n is TrieNodeExFrozen {
    if (!('id' in n)) {
        console.warn('%o', n);
    }
    if (!Object.isFrozen(n) || !('id' in n)) throw Error('Must be TrieNodeExFrozen');
}
