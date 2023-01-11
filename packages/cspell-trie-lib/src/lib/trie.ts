import type { Sequence } from 'gensequence';
import { genSequence } from 'gensequence';

import { CASE_INSENSITIVE_PREFIX, COMPOUND_FIX, FORBID_PREFIX, OPTIONAL_COMPOUND_FIX } from './constants';
import type { FindFullResult, FindOptions, PartialFindOptions } from './find';
import { createFindOptions, findLegacyCompound, findWord, findWordNode, isForbiddenWord } from './find';
import { genSuggestions, suggest } from './suggest';
import type { SuggestionCollector, SuggestionResult } from './suggestCollector';
import type { SuggestionOptions } from './suggestions/genSuggestionsOptions';
import {
    clean,
    countWords,
    createTriFromList,
    insert,
    isWordTerminationNode,
    iteratorTrieWords,
    mergeOptionalWithDefaults,
    orderTrie,
} from './trie-util';
import type { PartialTrieOptions, TrieNode, TrieOptions, TrieRoot } from './TrieNode';
import { replaceAllFactory } from './utils/util';
import type { CompoundWordsMethod, WalkerIterator } from './walker';
import { walker } from './walker';

export {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    defaultTrieOptions,
    FORBID_PREFIX,
    OPTIONAL_COMPOUND_FIX,
} from './constants';
export { PartialTrieOptions, TrieOptions } from './TrieNode';

/** @deprecated */
export const COMPOUND = COMPOUND_FIX;
/** @deprecated */
export const OPTIONAL_COMPOUND = OPTIONAL_COMPOUND_FIX;
/** @deprecated */
export const NORMALIZED = CASE_INSENSITIVE_PREFIX;
/** @deprecated */
export const FORBID = FORBID_PREFIX;

const defaultLegacyMinCompoundLength = 3;

export class Trie {
    private _options: TrieOptions;
    private _findOptionsDefaults: PartialFindOptions;
    private _findOptionsExact: FindOptions;
    readonly isLegacy: boolean;
    private hasForbidden: boolean;
    constructor(readonly root: TrieRoot, private count?: number) {
        this._options = mergeOptionalWithDefaults(root);
        this.isLegacy = this.calcIsLegacy();
        this.hasForbidden = !!root.c.get(root.forbiddenWordPrefix);
        this._findOptionsDefaults = {
            caseInsensitivePrefix: this._options.stripCaseAndAccentsPrefix,
            compoundFix: this._options.compoundCharacter,
            forbidPrefix: this._options.forbiddenWordPrefix,
        };
        this._findOptionsExact = this.createFindOptions({ compoundMode: 'none' });
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

    get options(): TrieOptions {
        return this._options;
    }

    /**
     * @param text - text to find in the Trie
     * @param minCompoundLength - deprecated - allows words to be glued together
     */
    find(text: string, minCompoundLength: boolean | number = false): TrieNode | undefined {
        const minLength: number | undefined = !minCompoundLength
            ? undefined
            : minCompoundLength === true
            ? defaultLegacyMinCompoundLength
            : minCompoundLength;
        const options = this.createFindOptions({
            compoundMode: minLength ? 'legacy' : 'compound',
            legacyMinCompoundLength: minLength,
        });
        return findWordNode(this.root, text, options).node;
    }

    /**
     *
     * @param text - text to search for
     * @param minCompoundLength - minimum word compound length
     * @deprecated - this method is no longer needed since compounding can be explicitly defined by the dictionary words.
     */
    findCompound(text: string, minCompoundLength = defaultLegacyMinCompoundLength): TrieNode | undefined {
        const options = this.createFindOptions({ legacyMinCompoundLength: minCompoundLength });
        const r = findLegacyCompound(this.root, text, options);
        return r.node;
    }

    findExact(text: string): TrieNode | undefined {
        return findWordNode(this.root, text, this._findOptionsExact).node;
    }

    has(word: string, minLegacyCompoundLength?: boolean | number): boolean {
        if (this.hasWord(word, false)) return true;
        if (minLegacyCompoundLength) {
            const f = this.findWord(word, { useLegacyWordCompounds: minLegacyCompoundLength });
            return !!f.found;
        }
        return false;
    }

    /**
     * Determine if a word is in the dictionary.
     * @param word - the exact word to search for - must be normalized.
     * @param caseSensitive - false means also searching a dictionary where the words were normalized to lower case and accents removed.
     * @returns true if the word was found and is not forbidden.
     */
    hasWord(word: string, caseSensitive: boolean): boolean {
        const f = this.findWord(word, { caseSensitive });
        return !!f.found && !f.forbidden;
    }

    findWord(word: string, options?: FindWordOptions): FindFullResult {
        if (options?.useLegacyWordCompounds) {
            const len =
                options.useLegacyWordCompounds !== true
                    ? options.useLegacyWordCompounds
                    : defaultLegacyMinCompoundLength;
            const findOptions = this.createFindOptions({
                legacyMinCompoundLength: len,
                matchCase: options.caseSensitive,
            });
            return findLegacyCompound(this.root, word, findOptions);
        }
        const findOptions = this.createFindOptionsMatchCase(options?.caseSensitive);
        return findWord(this.root, word, findOptions);
    }

    /**
     * Determine if a word is in the forbidden word list.
     * @param word the word to lookup.
     */
    isForbiddenWord(word: string): boolean {
        return this.hasForbidden && isForbiddenWord(this.root, word, this.options.forbiddenWordPrefix);
    }

    /**
     * Provides an ordered sequence of words with the prefix of text.
     */
    completeWord(text: string): Sequence<string> {
        const n = this.find(text);
        const compoundChar = this.options.compoundCharacter;
        const subNodes = iteratorTrieWords(n || {})
            .filter((w) => w[w.length - 1] !== compoundChar)
            .map((suffix) => text + suffix);
        return genSequence(n && isWordTerminationNode(n) ? [text] : []).concat(subNodes);
    }

    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * @param text - the text to search for
     * @param maxNumSuggestions - the maximum number of suggestions to return.
     * @param compoundMethod - Use to control splitting words.
     * @param numChanges - the maximum number of changes allowed to text. This is an approximate value, since some changes cost less than others.
     *                      the lower the value, the faster results are returned. Values less than 4 are best.
     */
    suggest(text: string, options: SuggestionOptions): string[] {
        return this.suggestWithCost(text, options).map((a) => a.word);
    }

    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
     */
    suggestWithCost(text: string, options: SuggestionOptions): SuggestionResult[] {
        const sep = options.compoundSeparator;
        const adjWord = sep ? replaceAllFactory(sep, '') : (a: string) => a;
        const optFilter = options.filter;
        const filter = optFilter
            ? (word: string, cost: number) => {
                  const w = adjWord(word);
                  return !this.isForbiddenWord(w) && optFilter(w, cost);
              }
            : (word: string) => !this.isForbiddenWord(adjWord(word));
        const opts = { ...options, filter };
        return suggest(this.root, text, opts);
    }

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void {
        const filter = (word: string) => !this.isForbiddenWord(word);
        const options = clean({ compoundMethod, ...collector.genSuggestionOptions });
        const suggestions = genSuggestions(this.root, collector.word, options);
        collector.collect(suggestions, undefined, filter);
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

    insert(word: string): this {
        insert(word, this.root);
        return this;
    }

    private calcIsLegacy(): boolean {
        const c = this.root.c;
        return !(
            c?.get(this._options.compoundCharacter) ||
            c?.get(this._options.stripCaseAndAccentsPrefix) ||
            c?.get(this._options.forbiddenWordPrefix)
        );
    }

    static create(words: Iterable<string> | IterableIterator<string>, options?: PartialTrieOptions): Trie {
        const root = createTriFromList(words, options);
        orderTrie(root);
        return new Trie(root, undefined);
    }

    private createFindOptions(options: PartialFindOptions = {}): FindOptions {
        const findOptions = createFindOptions({
            ...this._findOptionsDefaults,
            ...options,
        });
        return findOptions;
    }

    private lastCreateFindOptionsMatchCaseMap = new Map<boolean | undefined, FindOptions>();
    private createFindOptionsMatchCase(matchCase: boolean | undefined) {
        const f = this.lastCreateFindOptionsMatchCaseMap.get(matchCase);
        if (f !== undefined) return f;
        const findOptions = this.createFindOptions({ matchCase });
        this.lastCreateFindOptionsMatchCaseMap.set(matchCase, findOptions);
        return findOptions;
    }
}

export interface FindWordOptions {
    caseSensitive?: boolean;
    useLegacyWordCompounds?: boolean | number;
}
