import { opAppend, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import type { WeightMap } from './distance/index.ts';
import { createFindOptions, findLegacyCompound, findWord, findWordNode, isForbiddenWord } from './ITrieNode/find.ts';
import type { FindOptions, PartialFindOptions } from './ITrieNode/FindOptions.ts';
import type { ITrieNode, ITrieNodeRoot } from './ITrieNode/index.ts';
import type { FindFullResult } from './ITrieNode/ITrieNode.ts';
import { countWords, iteratorTrieWords } from './ITrieNode/trie-util.ts';
import type { PartialTrieInfo, TrieInfo } from './ITrieNode/TrieInfo.ts';
import { walker } from './ITrieNode/walker/walker.ts';
import type { CompoundWordsMethod, WalkerIterator } from './ITrieNode/walker/walkerTypes.ts';
import type { SuggestionCollector, SuggestionResult } from './suggestCollector.ts';
import { createSuggestionOptions, type SuggestionOptions } from './suggestions/genSuggestionsOptions.ts';
import { genSuggestions, suggest } from './suggestions/suggestTrieData.ts';
import { FastTrieBlobBuilder } from './TrieBlob/FastTrieBlobBuilder.ts';
import type { TrieData } from './TrieData.ts';
import { clean } from './utils/clean.ts';
import { memorizeLastCall } from './utils/memorizeLastCall.ts';
import { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.ts';
import { replaceAllFactory } from './utils/util.ts';

const defaultLegacyMinCompoundLength = 3;

const cvtFindWordOptions = memorizeLastCall(_cvtFindWordOptions);

function _cvtFindWordOptions(options: FindWordOptionsRO | undefined): Readonly<FindOptions> {
    return createFindOptions({
        matchCase: options?.caseSensitive,
        checkForbidden: options?.checkForbidden,
        compoundSeparator: options?.compoundSeparator,
    });
}

export interface ITrie {
    readonly data: TrieData;

    /**
     * Approximate number of words in the Trie, the first call to this method might be expensive.
     * Use `size` to get the number of nodes.
     *
     * It does NOT count natural compound words. Natural compounds are words that are composed of appending
     * multiple words to make a new word. This is common in languages like German and Dutch.
     */
    numWords(): number;

    /**
     * Used to check if the number of words has been calculated.
     */
    isNumWordsKnown(): boolean;

    /**
     * The number of nodes in the Trie. There is a rough corelation between the size and the number of words.
     */
    readonly size: number;
    readonly info: Readonly<TrieInfo>;

    /**
     * @param text - text to find in the Trie
     */
    find(text: string): ITrieNode | undefined;

    /**
     * A case sensitive search for the word.
     * @param word - the word to search for.
     * @returns true if the word is found and not forbidden.
     */
    has(word: string): boolean;

    /**
     * The legacy case insensitive search for the word.
     * @param word - the word to search for.
     * @param minLegacyCompoundLength - minimum length of legacy compounds to consider.
     * @returns true if the word is found and not forbidden.
     * @deprecated use hasWord or findWord instead. Support for this method signature may be removed in the future.
     */
    has(word: string, minLegacyCompoundLength: boolean | number): boolean;

    /**
     * Determine if a word is in the dictionary.
     * @param word - the exact word to search for - must be normalized.
     * @param caseSensitive - false means also searching a dictionary where the words were normalized to lower case and accents removed.
     * @returns true if the word was found and is not forbidden.
     */
    hasWord(word: string, caseSensitive: boolean): boolean;

    findWord(word: string, options?: FindWordOptionsRO): FindFullResult;

    /**
     * Determine if a word is in the forbidden word list.
     * @param word the word to lookup.
     */
    isForbiddenWord(word: string): boolean;

    /**
     * Provides an ordered sequence of words with the prefix of text.
     */
    completeWord(text: string): Iterable<string>;

    /**
     * Checks to see if there are preferred suggestions for the given text.
     *
     * @param word
     */
    wordHasPreferredSuggestions(word: string): boolean;

    /**
     * Get preferred suggestions for the given text.
     * @param text - the exact word to search for.
     */
    getPreferredSuggestions(text: string): Iterable<string>;

    /**
     * Checks to see if the trie contains preferred suggestions for any words.
     */
    readonly hasPreferredSuggestions: boolean;

    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * @param text - the text to search for
     * @param options - Controls the generated suggestions:
     * - ignoreCase - Ignore Case and Accents
     * - numSuggestions - the maximum number of suggestions to return.
     * - compoundMethod - Use to control splitting words.
     * - changeLimit - the maximum number of changes allowed to text. This is an approximate value, since some changes cost less than others.
     *                      the lower the value, the faster results are returned. Values less than 4 are best.
     */
    suggest(text: string, options: SuggestionOptions): string[];

    /**
     * Suggest spellings for `text`.  The results are sorted by edit distance with changes near the beginning of a word having a greater impact.
     * The results include the word and adjusted edit cost.  This is useful for merging results from multiple tries.
     */
    suggestWithCost(text: string, options: SuggestionOptions): SuggestionResult[];

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;

    /**
     * Returns an iterator that can be used to get all words in the trie. For some dictionaries, this can result in millions of words.
     * @param prefix - optional prefix to filter the words returned. The words will be prefixed with this value.
     */
    words(prefix?: string): Iterable<string>;

    /**
     * Allows iteration over the entire tree.
     * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
     */
    iterate(): WalkerIterator;

    readonly weightMap: WeightMap | undefined;
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    // readonly hasPreferredSuggestions: boolean;
}

export class ITrieImpl implements ITrie {
    private _info: TrieInfo;
    private root: ITrieNodeRoot;
    private count?: number;
    weightMap: WeightMap | undefined;
    #optionsCompound = this.createFindOptions({ compoundMode: 'compound' });
    #findOptionsT: FindWordOptionsRO = { caseSensitive: true, checkForbidden: true };
    #findOptionsF: FindWordOptionsRO = { caseSensitive: false, checkForbidden: true };

    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    readonly data: TrieData;

    constructor(data: TrieData) {
        this.data = data;
        this.root = data.getRoot();
        this._info = mergeOptionalWithDefaults(data.info);
        this.hasForbiddenWords = data.hasForbiddenWords;
        this.hasCompoundWords = data.hasCompoundWords;
        this.hasNonStrictWords = data.hasNonStrictWords;
    }

    /**
     * Number of words in the Trie, the first call to this method might be expensive.
     * Use `size` to get the number of nodes.
     */
    numWords(): number {
        this.count ??= countWords(this.root);
        return this.count;
    }

    isNumWordsKnown(): boolean {
        return this.count !== undefined;
    }

    get size(): number {
        return this.data.size;
    }

    get info(): Readonly<TrieInfo> {
        return this._info;
    }

    /**
     * @param text - text to find in the Trie
     */
    find(text: string): ITrieNode | undefined {
        return findWordNode(this.data.getRoot(), text, this.#optionsCompound).node;
    }

    /**
     * A case sensitive search for the word.
     * @param word - the word to search for.
     * @returns true if the word is found and not forbidden.
     */
    has(word: string): boolean;

    /**
     * The legacy case insensitive search for the word.
     * @param word - the word to search for.
     * @param minLegacyCompoundLength - minimum length of legacy compounds to consider.
     * @returns true if the word is found and not forbidden.
     * @deprecated use hasWord or findWord instead. Support for this method signature may be removed in the future.
     */
    has(word: string, minLegacyCompoundLength: boolean | number): boolean;

    /**
     * A case sensitive search for the word.
     * @param word - the word to search for.
     * @param minLegacyCompoundLength - minimum length of legacy compounds to consider.
     * @returns true if the word is found and not forbidden.
     */
    has(word: string, minLegacyCompoundLength?: boolean | number): boolean {
        if (minLegacyCompoundLength !== undefined) return this.#hasLegacy(word, minLegacyCompoundLength);
        return this.hasWord(word, true);
    }

    #hasLegacy(word: string, minLegacyCompoundLength: boolean | number): boolean {
        if (this.hasWord(word, false)) return true;
        if (minLegacyCompoundLength) {
            const f = this.findWord(word, {
                useLegacyWordCompounds: minLegacyCompoundLength,
                caseSensitive: false,
                checkForbidden: true,
            });
            return !!f.found && !f.forbidden;
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
        const options = caseSensitive ? this.#findOptionsT : this.#findOptionsF;
        const r = this.findWord(word, options);
        return !r.forbidden && !!r.found;
    }

    findWord(word: string, options?: FindWordOptionsRO): FindFullResult {
        if (options?.useLegacyWordCompounds) {
            const len =
                options.useLegacyWordCompounds !== true
                    ? options.useLegacyWordCompounds
                    : defaultLegacyMinCompoundLength;
            const findOptions = this.createFindOptions({
                legacyMinCompoundLength: len,
                matchCase: options.caseSensitive || false,
                compoundSeparator: undefined,
            });
            return findLegacyCompound(this.root, word, findOptions);
        }
        return findWord(this.root, word, cvtFindWordOptions(options));
    }

    /**
     * Determine if a word is in the forbidden word list.
     * @param word the word to lookup.
     */
    isForbiddenWord(word: string): boolean {
        return this.hasForbiddenWords && isForbiddenWord(this.root, word, this.info.forbiddenWordPrefix);
    }

    /**
     * Provides an ordered sequence of words with the prefix of text.
     */
    completeWord(text: string): Iterable<string> {
        const n = this.find(text);
        const compoundChar = this.info.compoundCharacter;
        const subNodes = pipe(
            n ? iteratorTrieWords(n) : [],
            opFilter((w) => w[w.length - 1] !== compoundChar),
            opMap((suffix) => text + suffix),
        );
        return pipe(n && n.eow ? [text] : [], opAppend(subNodes));
    }

    /**
     * Checks to see if there are preferred suggestions for the given text.
     * @param text
     */
    wordHasPreferredSuggestions(_text: string): boolean {
        return false;
    }

    /**
     * Get preferred suggestions for the given text.
     * @param text - the exact word to search for.
     */
    getPreferredSuggestions(_text: string): Iterable<string> {
        return [];
    }

    /**
     * Checks to see if the trie contains preferred suggestions for any words.
     */
    get hasPreferredSuggestions(): boolean {
        return this.data.hasPreferredSuggestions;
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
        const weightMap = options.weightMap || this.weightMap;
        const adjWord = sep ? replaceAllFactory(sep, '') : (a: string) => a;
        const optFilter = options.filter;
        const filter = optFilter
            ? (word: string, cost: number) => {
                  const w = adjWord(word);
                  return !this.isForbiddenWord(w) && optFilter(w, cost);
              }
            : (word: string) => !this.isForbiddenWord(adjWord(word));
        const opts = { ...options, filter, weightMap };
        return suggest(this.data, text, opts);
    }

    /**
     * genSuggestions will generate suggestions and send them to `collector`. `collector` is responsible for returning the max acceptable cost.
     * Costs are measured in weighted changes. A cost of 100 is the same as 1 edit. Some edits are considered cheaper.
     * Returning a MaxCost < 0 will effectively cause the search for suggestions to stop.
     */
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void {
        const filter = (word: string) => !this.isForbiddenWord(word);
        const options = createSuggestionOptions(clean({ compoundMethod, ...collector.genSuggestionOptions }));
        const suggestions = genSuggestions(this.data, collector.word, options);
        collector.collect(suggestions, undefined, filter);
    }

    /**
     * Returns an iterator that can be used to get all words in the trie. For some dictionaries, this can result in millions of words.
     * Note: this will not compound words automatically.
     * @param prefix - optional prefix to filter the words returned. The words will be prefixed with this value.
     */
    words(prefix?: string): Iterable<string> {
        return this.data.words(prefix);
    }

    /**
     * Allows iteration over the entire tree.
     * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
     */
    iterate(): WalkerIterator {
        return walker(this.root);
    }

    static create(words: Iterable<string> | IterableIterator<string>, info?: PartialTrieInfo): ITrie {
        const builder = new FastTrieBlobBuilder(info);
        builder.insert(words);
        const root = builder.build();
        return new ITrieImpl(root);
    }

    private createFindOptions(options: Readonly<PartialFindOptions> | undefined): Readonly<FindOptions> {
        const findOptions = createFindOptions(options);
        return findOptions;
    }
}
export interface FindWordOptions {
    caseSensitive?: boolean;
    useLegacyWordCompounds?: boolean | number;
    checkForbidden?: boolean;
    /**
     * Separate compound words with the given string.
     */
    compoundSeparator?: string;
}

export type FindWordOptionsRO = Readonly<FindWordOptions>;
