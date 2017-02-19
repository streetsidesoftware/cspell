import {Sequence, genSequence} from 'gensequence';
import {TrieNode} from './TrieNode';
import {suggest, SuggestionResult} from './suggest';
import {
    iteratorTrieWords,
    walker,
    WalkerIterator,
    createTriFromList,
    orderTrie,
    isWordTerminationNode,
    insert,
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
    completeWord(text: string): Sequence<string> {
        const n = this.find(text);
        return genSequence(n && isWordTerminationNode(n) ? [text] : [])
            .concat(n ? iteratorTrieWords(n).map(suffix => text + suffix) : []);
    }

    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     */
    suggest(text: string, maxNumSuggestions: number): string[] {
        return this.suggestWithCost(text, maxNumSuggestions)
            .map(a => a.word);
    }


    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
     */
    suggestWithCost(text: string, maxNumSuggestions: number): SuggestionResult[] {
        return suggest(this.root, text, maxNumSuggestions);
    }

    words(): Sequence<string> {
        return iteratorTrieWords(this.root);
    }

    /**
     * Allows iteration over the entire tree.
     * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
     */
    iterate(): WalkerIterator {
        return walker(this.root);
    }

    insert(word: string) {
        insert(word, this.root);
        return this;
    }

    static create(words: Iterable<string> | IterableIterator<string>): Trie {
        const root = createTriFromList(words);
        orderTrie(root);
        return new Trie(root);
    }
}
