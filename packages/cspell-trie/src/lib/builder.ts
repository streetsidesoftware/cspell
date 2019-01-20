import { TrieNode, FLAG_WORD } from './TrieNode';

export class DawgChildMap extends Map<string, DawgTrieNode> {}
export interface DawgTrieNode extends TrieNode {
    c?: DawgChildMap;
    id: number;
    hash: number;
    p: Set<DawgTrieNode>;
}

const EOW = '\r'.codePointAt(0)!;

export class DawgTrieBuilder {
    protected nextId = 1;
    protected nodes: Map<number, DawgTrieNode> = new Map();
    protected hashNodes: Map<number, Set<DawgTrieNode>> = new Map();
    protected leaf: DawgTrieNode = { id: 0, hash: 0, p: new Set(), f: FLAG_WORD, };
    protected root: DawgTrieNode = this.leaf;

    constructor() {
        const r = this.leaf;
        this.root = r;
        this.nodes.set(r.id, r);
        this.hashNodes.set(r.hash, new Set(this.nodes.values()));
    }

    get trie(): DawgTrieNode { return this.root; }

    addWord(word: string) {
        this.root = this.addToNode(this.root, word);
    }

    protected addToNode(curr: DawgTrieNode, s: string): DawgTrieNode {
        if (!s.length) {
            if (curr.f || (curr.c && curr.c.has(s))) {
                return curr;
            }
            const c = curr.c || new Map([[s, this.leaf]]);
            return this.createNode(c);
        }

        const h = s.slice(0, 1);
        const t = s.slice(1);
        const n0 = curr.c && curr.c.get(h);
        const n = n0 || { id: -1, hash: -1, p: new Set() };
        const c = this.addToNode(n, t);
        if (c === n0) {
            return curr;
        }
        this.rememberNode(c);
        const children = curr.c ? new Map(curr.c) : new Map();
        children.set(h, c);
        const newNode = this.createNode(children);
        c.p.add(newNode);
        return newNode;
    }

    protected createNode(children: DawgChildMap): DawgTrieNode {
        const n = {
            id: -1,
            hash: this.hash(children),
            p: new Set(),
            c: children,
        };
        const match = this.findHashMatch(n);
        if (match) {
            return match!;
        }
        n.id = this.nextId++;
        this.rememberNode(n);

        return n;
    }

    protected hash(children: DawgChildMap | undefined): number {
        if (!children) {
            return 0;
        }
        let h = 0;
        for (const [c, n] of children) {
            const v = c.codePointAt(0) || EOW;
            h += v * v + n.id * n.id + n.hash * n.hash;
        }

        return Math.sqrt(h);
    }

    protected rememberNode(n: DawgTrieNode) {
        this.nodes.set(n.id, n);
        const h = this.hashNodes.get(n.hash) || new Set();
        this.hashNodes.set(n.hash, h.add(n));
    }

    protected findHashMatch(n: DawgTrieNode): DawgTrieNode | undefined {
        const matches = this.hashNodes.get(n.hash);
        if (!matches) {
            return undefined;
        }
        for (const m of matches) {
            if (this.isEquiv(n, m)) {
                return m;
            }
        }
        return undefined;
    }

    protected isEquiv(a: DawgTrieNode, b: DawgTrieNode): boolean {
        if (a.hash !== b.hash) {
            return false;
        }
        if (a.c === b.c) {
            return true;
        }
        if (!a.c || !b.c) {
            return false;
        }
        for (const [k, v] of b.c) {
            if (a.c.get(k) !== v) {
                return false;
            }
        }
        for (const [k, v] of a.c) {
            if (b.c.get(k) !== v) {
                return false;
            }
        }
        return true;
    }
}
