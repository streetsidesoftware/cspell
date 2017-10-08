import {Sequence, genSequence} from 'gensequence';
import {TrieNode, FLAG_WORD} from './TrieNode';
import {
    genSuggestions,
    suggest,
    SuggestionCollector,
    SuggestionResult,
    CompoundWordsMethod,
} from './suggest';
import {
    createTriFromList,
    insert,
    isWordTerminationNode,
    iteratorTrieWords,
    orderTrie,
} from './util';
import {walker, WalkerIterator} from './walker';

export class Trie {
    constructor(readonly root: TrieNode) {
        // The root can be a word
        root.f = root.f ? (root.f & ~FLAG_WORD) : root.f;
    }

    find(text: string, useCompounds: boolean = false): TrieNode | undefined {
        return useCompounds ? this.findCompound(text) : this.findExact(text);
    }

    findCompound(text: string): TrieNode | undefined {
        let n: TrieNode | undefined = this.root;
        let p: number;
        let q: number;
        for (p = 0; n && n.c && p < text.length; p = q) {
            n = n.c.get(text[p]);
            q = p + 1;
            if (n && n.f && q < text.length) {
                const r = this.findCompound(text.slice(q));
                if (r && r.f) {
                    return r;
                }
            }
        }
        return p === text.length ? n : undefined;
    }

    findExact(text: string): TrieNode | undefined {
        let n: TrieNode | undefined = this.root;
        let p: number;
        for (p = 0; n && n.c && p < text.length; ++p) {
            n = n.c.get(text[p]);
        }
        return p === text.length ? n : undefined;
    }

    has(word: string, useCompounds?: boolean): boolean {
        const n = this.find(word, useCompounds);
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
    suggest(text: string, maxNumSuggestions: number, compoundMethod?: CompoundWordsMethod): string[] {
        return this.suggestWithCost(text, maxNumSuggestions, compoundMethod)
            .map(a => a.word);
    }


    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
     */
    suggestWithCost(text: string, maxNumSuggestions: number, compoundMethod?: CompoundWordsMethod): SuggestionResult[] {
        return suggest(this.root, text, maxNumSuggestions, compoundMethod);
    }

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void {
        collector.collect(genSuggestions(this.root, collector.word, compoundMethod));
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
