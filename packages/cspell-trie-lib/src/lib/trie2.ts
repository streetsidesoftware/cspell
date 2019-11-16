import { TrieNode2 } from './TrieNode2';

export class Trie2 {
    constructor(readonly root: TrieNode2[]) {
    }
}

const END_OF_WORD: TrieNode2 = Object.freeze({ i: 0, s: '' });

export class Trie2Builder {
    protected nodes: TrieNode2[] = [END_OF_WORD];
    protected root: TrieNode2[] = [];

    insert(word: string): Trie2Builder {
        this.insertRecursive(this.root, word);
        return this;
    }

    protected insertRecursive(nodes: TrieNode2[], word: string) {
        // Find matching node
        let found: TrieNode2 | undefined;
        for (const n of nodes) {
            if (n.s === word.slice(0, n.s.length) && (n.s.length || n.s.length === word.length)) {
                found = n;
                break;
            }
        }

        if (!found) {
            found = word ? this.createNode(word[0]) : END_OF_WORD;
            nodes.push(found);
        }

        if (found.s) {
            const c = found.c || [];
            found.c = c;
            this.insertRecursive(c, word.slice(found.s.length));
        }
    }

    protected createNode(s: string): TrieNode2 {
        const n: TrieNode2 = { i: this.nodes.length, s };
        this.nodes.push(n);
        return n;
    }

    build(): Trie2 {
        return new Trie2(this.root);
    }
}
