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

    find(text: string, minCompoundLength: boolean | number = false): TrieNode | undefined {
        const minLength: number | undefined = !minCompoundLength || minCompoundLength === true ? undefined : minCompoundLength;
        return minCompoundLength ? this.findCompound(text, minLength) : this.findExact(text);
    }

    findCompound(text: string, minCompoundLength = 3, minLength = 0): TrieNode | undefined {
        let n: TrieNode | undefined = this.root;
        let p: number;
        let q: number;
        for (p = 0; n && n.c && p < text.length; p = q) {
            n = n.c.get(text[p]);
            q = p + 1;
            if (n && n.f && q < text.length && q >= minCompoundLength) {
                const r = this.findCompound(text.slice(q), minCompoundLength, minCompoundLength);
                if (r && r.f) {
                    return r;
                }
            }
        }
        return p === text.length && p >= minLength ? n : undefined;
    }

    findExact(text: string): TrieNode | undefined {
        let n: TrieNode | undefined = this.root;
        let p: number;
        for (p = 0; n && n.c && p < text.length; ++p) {
            n = n.c.get(text[p]);
        }
        return p === text.length ? n : undefined;
    }

    has(word: string, minCompoundLength?: boolean | number): boolean {
        const n = this.find(word, minCompoundLength);
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
     * @param text - the text to search for
     * @param maxNumSuggestions - the maximum number of suggestions to return.
     * @param compoundMethod - Use to control splitting words.
     * @param numChanges - the maximum number of changes allowed to text. This is an approximate value, since some changes cost less than others.
     *                      the lower the value, the faster results are returned. Values less than 4 are best.
     */
    suggest(text: string, maxNumSuggestions: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): string[] {
        return this.suggestWithCost(text, maxNumSuggestions, compoundMethod, numChanges)
            .map(a => a.word);
    }


    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
     */
    suggestWithCost(text: string, maxNumSuggestions: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[] {
        return suggest(this.root, text, maxNumSuggestions, compoundMethod, numChanges);
    }

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void {
        collector.collect(genSuggestions(this.root, collector.word, compoundMethod));
    }

    /**
     * Returns an iterator that can be used to get all words in the trie. For some dictionaries, this can result in millions of words.
     */
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
