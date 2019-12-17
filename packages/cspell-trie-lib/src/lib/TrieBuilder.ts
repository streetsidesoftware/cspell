import { TrieNode } from './TrieNode';
import { Trie } from './trie';

export function buildTrie(words: Iterable<string>): Trie {
    return new TrieBuilder(words).build();
}

export class TrieBuilder {
    private count: number = 0;
    private readonly signatures = new Map<string, TrieNode>();
    private readonly cached = new Map<TrieNode, number>();
    private _root: TrieNode = { f: undefined, c: undefined };
    private _eow: TrieNode = Object.freeze({ f: 1 });

    constructor(words?: Iterable<string>) {
        this._canBeCached(this._eow); // this line is just for coverage reasons
        this.signatures.set(this.signature(this._eow), this._eow);
        this.cached.set(this._eow, this.count++);

        if (words) {
            this.insert(words);
        }
    }

    private signature(n: TrieNode): string {
        const isWord = n.f ? '*' : '';
        const ref = n.c
            ? JSON.stringify([...n.c.entries()].map(([k, n]) => [k, this.cached.get(n)]))
            : '';
        return isWord + ref;
    }

    private _canBeCached(n: TrieNode): boolean {
        if (!n.c)
            return true;
        for (const v of n.c) {
            if (!this.cached.has(v[1]))
                return false;
        }
        return true;
    }

    private freeze(n: TrieNode) {
        if (Object.isFrozen(n)) return n;
        // istanbul ignore else
        if (n.c) {
            const c = [...n.c]
                .sort((a, b) => a[0] < b[0] ? -1 : 1)
                .map(([k, n]) => [k, this.freeze(n)] as [string, TrieNode]);
            n.c = new Map(c);
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
            if (!this.cached.has(ref) && ref !== n) {
                this.cached.set(ref, this.count++);
            }
            return ref;
        }

        this.signatures.set(sig, this.freeze(n));
        return n;
    }

    private _insert(node: TrieNode, s: string): TrieNode {
        if (!s) {
            if (!node.c) {
                return this._eow;
            } else {
                node = Object.isFrozen(node) ? {...node} : node;
                node.f = this._eow.f;
                return node;
            }
        }
        const head = s[0];
        const tail = s.slice(1);

        const child = this._insert(node.c?.get(head) ?? { f: undefined, c: undefined }, tail);
        if (node.c?.get(head) !== child) {
            if (!node.c || Object.isFrozen(node)) {
                node = {...node, c: new Map(node.c ?? [])};
            }
            node.c!.set(head, child);
        }

        return Object.isFrozen(child) ? this.tryToCache(node) : node;
    }

    insertWord(word: string) {
        this._root = this._insert(this._root, word);
    }

    insert(words: Iterable<string>) {
        for (const w of words) {
            this.insertWord(w);
        }
    }

    /**
     * Resets the builder
     */
    reset() {
        this._root = {};
        this.cached.clear();
        this.signatures.clear();
    }

    build(): Trie {
        const root = this._root;
        // Reset the builder to prevent updating the trie in the background.
        this.reset();
        return new Trie(this.freeze(root));
    }
}
