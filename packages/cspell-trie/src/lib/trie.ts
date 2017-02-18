import {Sequence, genSequence} from 'gensequence';
import {TrieNode, FLAG_WORD} from './TrieNode';
import {
    iteratorTrieWords,
    walker,
    WalkerIterator,
    createTriFromList,
    orderTrie,
    isWordTerminationNode,
} from './util';

export class Trie {
    constructor(readonly root: TrieNode) {}

    find(text: string): TrieNode | undefined {
        let n: TrieNode | undefined = this.root;
        for (let p = 0; n && n.c && p < text.length; ++p) {
            n = n.c.get(text[p]);
        }
        return n;
    }

    has(word: string): boolean {
        const n = this.find(word);
        return !!n && isWordTerminationNode(n);
    }

    /**
     * Provides an ordered sequence of words with the prefix of text.
     */
    complete(text: string): Sequence<string> {
        const n = this.find(text);
        return genSequence(n && isWordTerminationNode(n) ? [text] : [])
            .concat(n ? iteratorTrieWords(n).map(suffix => text + suffix) : []);
    }

    words(): Sequence<string> {
        return iteratorTrieWords(this.root);
    }

    iterate(): WalkerIterator {
        return walker(this.root);
    }

    static create(words: Iterable<string> | IterableIterator<string>): Trie {
        const root = createTriFromList(words);
        orderTrie(root);
        return new Trie(root);
    }
}
