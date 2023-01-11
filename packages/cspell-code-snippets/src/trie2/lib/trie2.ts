import type { TrieNode2, TrieNode2Branch, TrieNode2EOW, TrieNode2Root } from './TrieNode2';
import { END_OF_WORD as EOW } from './TrieNode2';

export class Trie2 {
    constructor(readonly root: TrieNode2Root) {}
}

const END_OF_WORD: TrieNode2EOW = Object.freeze({ i: 0, s: EOW });

export class Trie2Builder {
    protected nodes: TrieNode2[] = [END_OF_WORD];
    protected root: TrieNode2Root = { s: '', c: [] };

    insert(word: string): Trie2Builder {
        const location = this.findInsertLocation(this.root, word);
        this.splitNode(location);
        return this;
    }

    protected findInsertLocation(root: TrieNode2Branch, word: string): InsertLocation {
        let n = root;
        let p = 0;
        let keepGoing = true;
        while (p < word.length && keepGoing) {
            keepGoing = false;
            for (const c of n.c) {
                if (!isTrieNode2Branch(c)) continue;
                const s = c.s;
                const limit = Math.min(s.length, word.length - p);
                let i = 0;
                for (; i < limit && word[p + i] === s[i]; ++i) {
                    /* empty */
                }
                if (i) {
                    p += i;
                    if (i < s.length || p === word.length) {
                        return {
                            node: c,
                            word: word.slice(p),
                            splitPos: i,
                        };
                    }
                    n = c;
                    keepGoing = true;
                    break;
                }
            }
        }
        return {
            node: n,
            word: word.slice(p),
            splitPos: n.s.length,
        };
    }

    protected splitNode(location: InsertLocation): void {
        const { node, word, splitPos } = location;
        const wordNode = this.createNode(word);
        if (node.s.length === splitPos) {
            if (!node.c.includes(wordNode)) {
                node.c.push(this.createNode(word));
            }
            return;
        }
        const s = node.s;
        node.s = s.slice(0, splitPos);
        node.c = [this.createNode(s.slice(splitPos), node.c), wordNode];
    }

    protected createNode(s: string, c: TrieNode2[] = [END_OF_WORD]): TrieNode2 {
        if (s === '') {
            return END_OF_WORD;
        }
        const n: TrieNode2 = { s, c };
        this.nodes.push(n);
        return n;
    }

    build(): Trie2 {
        return new Trie2(this.root);
    }
}

export function isTrieNode2Branch(n: TrieNode2): n is TrieNode2Branch {
    return !!(n as TrieNode2Branch).c;
}

interface InsertLocation {
    node: TrieNode2Branch;
    word: string;
    splitPos: number;
}
