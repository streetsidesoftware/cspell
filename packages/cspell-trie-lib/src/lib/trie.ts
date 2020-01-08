import {Sequence, genSequence} from 'gensequence';
import {TrieNode} from './TrieNode';
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
    countWords,
    mergeDefaults,
} from './util';
import {walker, WalkerIterator} from './walker';

import {
    COMPOUND_FIX,
    OPTIONAL_COMPOUND_FIX,
    CASE_INSENSITIVE_PREFIX,
    FORBID_PREFIX,
} from './constants';
import { findLegacyCompoundWord, findCompoundWord, isForbiddenWord, findLegacyCompoundNode, findCompoundNode } from './find';

export {
    COMPOUND_FIX,
    OPTIONAL_COMPOUND_FIX,
    CASE_INSENSITIVE_PREFIX,
    FORBID_PREFIX,
} from './constants';

export interface TrieOptions {
    compoundCharacter: string;
    compoundOptionalCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
}

/** @deprecated */
export const COMPOUND = COMPOUND_FIX;
/** @deprecated */
export const OPTIONAL_COMPOUND = OPTIONAL_COMPOUND_FIX;
/** @deprecated */
export const NORMALIZED = CASE_INSENSITIVE_PREFIX;
/** @deprecated */
export const FORBID = FORBID_PREFIX;

const _defaultTrieOptions: Readonly<TrieOptions> = {
    compoundCharacter: COMPOUND_FIX,
    compoundOptionalCharacter: OPTIONAL_COMPOUND_FIX,
    stripCaseAndAccentsPrefix: CASE_INSENSITIVE_PREFIX,
    forbiddenWordPrefix: FORBID_PREFIX,
};

export const defaultTrieOptions: TrieOptions = Object.freeze(_defaultTrieOptions);

export type PartialTrieOptions = Partial<TrieOptions> | undefined;

export function mergeOptionalWithDefaults(options: PartialTrieOptions): TrieOptions {
    return mergeDefaults(options, defaultTrieOptions);
}

const defaultLegacyMinCompoundLength = 3;

export class Trie {
    private _options: TrieOptions;
    readonly isLegacy: boolean;
    constructor(readonly root: TrieNode, private count?: number, options?: PartialTrieOptions) {
        this._options = mergeOptionalWithDefaults(options);
        this.isLegacy = this.calcIsLegacy();
    }

    /**
     * Number of words in the Trie
     */
    size(): number {
        this.count = this.count ?? countWords(this.root);
        return this.count;
    }

    isSizeKnown(): boolean {
        return this.count !== undefined;
    }

    get options() {
        return this._options;
    }

    find(text: string, minCompoundLength: boolean | number = false): TrieNode | undefined {
        const minLength: number | undefined = !minCompoundLength || minCompoundLength === true ? undefined : minCompoundLength;
        return minCompoundLength ? this.findCompound(text, minLength) : this.findExact(text);
    }

    findCompound(text: string, minCompoundLength = defaultLegacyMinCompoundLength): TrieNode | undefined {
        const r = findLegacyCompoundNode(this.root, text, minCompoundLength);
        return r.node;
    }

    findExact(text: string): TrieNode | undefined {
        const r = findCompoundNode(this.root, text, this.options.compoundCharacter);
        return r.node;
    }

    has(word: string, minLegacyCompoundLength?: boolean | number): boolean {
        const f = findCompoundWord(this.root, word, this.options.compoundCharacter);
        if (!!f.found) return true;
        if (minLegacyCompoundLength) {
            const len = minLegacyCompoundLength !== true ? minLegacyCompoundLength : defaultLegacyMinCompoundLength;
            return !!findLegacyCompoundWord(this.root, word, len).found;
        }
        return false;
    }

    /**
     * Determine if a word is in the dictionary.
     * @param word - the exact word to search for - must be normalized - for non-case sensitive
     *      searches, word must be lower case with accents removed.
     * @param caseSensitive - false means searching a dictionary where the words were normalized to lower case and accents removed.
     * @returns true if the word was found and is not forbidden.
     */
    hasWord(word: string, caseSensitive: boolean): boolean {
        const root = !caseSensitive ? this.root.c?.get(this.options.stripCaseAndAccentsPrefix) || this.root : this.root;
        const f = findCompoundWord(root, word, this.options.compoundCharacter);
        return !!f.found;
    }

    /**
     * Determine if a word is in the forbidden word list.
     * @param word word to lookup.
     */
    isForbiddenWord(word: string): boolean {
        return isForbiddenWord(this.root, word, this.options.forbiddenWordPrefix);
    }

    /**
     * Provides an ordered sequence of words with the prefix of text.
     */
    completeWord(text: string): Sequence<string> {
        const n = this.find(text);
        const compoundChar = this.options.compoundCharacter;
        const subNodes = iteratorTrieWords(n || {}).filter(w => w[w.length - 1] !== compoundChar).map(suffix => text + suffix);
        return genSequence(n && isWordTerminationNode(n) ? [text] : [])
            .concat(subNodes);
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
        return suggest(this.getSuggestRoot(), text, maxNumSuggestions, compoundMethod, numChanges);
    }

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void {
        collector.collect(genSuggestions(this.getSuggestRoot(), collector.word, compoundMethod));
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

    private getSuggestRoot(): TrieNode {
        if (!this.root.c) return {};
        const blockNodes = new Set([
            this._options.compoundCharacter,
            this._options.forbiddenWordPrefix,
            this._options.stripCaseAndAccentsPrefix,
        ]);
        return { c: new Map([...this.root.c].filter(([k]) => !blockNodes.has(k)))};
    }

    private calcIsLegacy(): boolean {
        const c = this.root.c;
        return !(
            c?.get(this._options.compoundCharacter) ||
            c?.get(this._options.stripCaseAndAccentsPrefix) ||
            c?.get(this._options.forbiddenWordPrefix)
        );
    }

    static create(
        words: Iterable<string> | IterableIterator<string>,
        options?: PartialTrieOptions,
    ): Trie {
        const root = createTriFromList(words);
        orderTrie(root);
        return new Trie(root, undefined, options);
    }
}
