import { TrieNode, FLAG_WORD } from './TrieNode';
import { xxHash32 }  from 'js-xxhash';
// import * as crypto from 'crypto';
// const hash = crypto.createHash('md5');

export class DawgChildMap extends Map<string, DawgTrieNode> {}
export interface DawgTrieNode extends TrieNode {
    c?: DawgChildMap;
    id: number;
    hash: number;
}

const EOW = '\r';
const EOL = '\n';

// cspell:word hasher
function hasher() {
    const cache: Map<string, number> = new Map();

    return (s: string) => {
        if (!cache.has(s)) {
            cache.set(s, xxHash32(Buffer.from(s || EOW, 'utf16le')));
        }

        return cache.get(s)!;
    };
}

export class DawgTrieBuilder {
    private hasher = hasher();
    protected nextId = 1;
    protected nodes: Map<number, DawgTrieNode> = new Map();
    protected hashNodes: Map<number, Set<DawgTrieNode>> = new Map();
    protected leaf: DawgTrieNode = { id: 0, hash: 0, f: FLAG_WORD };
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
            const c =  new Map([...(curr.c || []), [s, this.leaf]]);
            return this.createNode(c);
        }

        const h = s.slice(0, 1);
        const t = s.slice(1);
        const n0 = curr.c && curr.c.get(h);
        const n = n0 || { id: -1, hash: -1 };
        const c = this.addToNode(n, t);
        if (c === n0) {
            return curr;
        }
        this.rememberNode(c);
        const children = curr.c ? new Map(curr.c) : new Map();
        children.set(h, c);
        return this.createNode(children);
    }

    protected createNode(children: DawgChildMap): DawgTrieNode {
        const n = {
            id: -1,
            hash: -1,
            c: children,
        };
        n.hash = this.hash(n);
        const match = this.findHashMatch(n);
        if (match) {
            return match!;
        }
        n.id = this.nextId++;
        this.rememberNode(n);

        return n;
    }

    protected hash(node: DawgTrieNode): number {
        if (!node.c) {
            return this.hasher(EOL);
        }
        let h = 0;
        for (const [c, n] of node.c) {
            const v = this.hasher(c);
            h = h ^ v ^ n.hash ^ n.id;
        }

        return h;
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

    static trieToString(r: DawgTrieNode): string {
        const displayed: Map<number, number> = new Map();

        function disp(n: DawgTrieNode, depth: number, prefix: string): string {
            if (displayed.has(n.id)) {
                const cnt = displayed.get(n.id)! + 1;
                displayed.set(n.id, cnt);
                return '  '.repeat(depth) + `${prefix}<${n.id}> (${cnt})\n`;
            }
            displayed.set(n.id, 1);
            const parts: string[] = ['  '.repeat(depth) + `${prefix}{ id: ${n.id}, h: ${DawgTrieBuilder.hashToString(n.hash)}: f:${n.f || '-'} }\n`];
            if (n.c) {
                for (const c of n.c) {
                    parts.push(disp(c[1], depth + 1, `"${c[0]}" --> `));
                }
            }
            return parts.join('');
        }

        return [disp(r, 0, ''), `Nodes: ${displayed.size}`].join('\n');
    }

    static hashToString(n: number) {
        return (n < 0 ? 4294967296 + n : n).toString(16).padStart(8, '0');
    }
}
