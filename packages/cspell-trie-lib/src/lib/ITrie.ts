import { opAppend, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import { CASE_INSENSITIVE_PREFIX, COMPOUND_FIX, FORBID_PREFIX, OPTIONAL_COMPOUND_FIX } from './constants.js';
import type { FindFullResult } from './ITrieNode/find.js';
import { createFindOptions, findLegacyCompound, findWord, findWordNode, isForbiddenWord } from './ITrieNode/find.js';
import type { FindOptions, PartialFindOptions } from './ITrieNode/FindOptions.js';
import type { ITrieNode, ITrieNodeRoot } from './ITrieNode/index.js';
import { countNodes, countWords, iteratorTrieWords } from './ITrieNode/trie-util.js';
import type { PartialTrieInfo, TrieInfo } from './ITrieNode/TrieInfo.js';
import { walker } from './ITrieNode/walker/walker.js';
import type { CompoundWordsMethod, WalkerIterator } from './ITrieNode/walker/walkerTypes.js';
import type { SuggestionCollector, SuggestionResult } from './suggestCollector.js';
import { createSuggestionOptions, type SuggestionOptions } from './suggestions/genSuggestionsOptions.js';
import { genSuggestions, suggest } from './suggestions/suggestTrieData.js';
import type { TrieData } from './TrieData.js';
import { TrieNodeTrie } from './TrieNode/TrieNodeTrie.js';
import { clean } from './utils/clean.js';
import { mergeOptionalWithDefaults } from './utils/mergeOptionalWithDefaults.js';
import { replaceAllFactory } from './utils/util.js';

export {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    defaultTrieInfo,
    FORBID_PREFIX,
    OPTIONAL_COMPOUND_FIX,
} from './constants.js';
export { PartialTrieInfo, TrieInfo } from './ITrieNode/TrieInfo.js';

/** @deprecated */
export const COMPOUND = COMPOUND_FIX;
/** @deprecated */
export const OPTIONAL_COMPOUND = OPTIONAL_COMPOUND_FIX;
/** @deprecated */
export const NORMALIZED = CASE_INSENSITIVE_PREFIX;
/** @deprecated */
export const FORBID = FORBID_PREFIX;

const defaultLegacyMinCompoundLength = 3;

export class ITrie {
    private _info: TrieInfo;
    private _findOptionsDefaults: PartialFindOptions;
    private hasForbidden: boolean;
    private root: ITrieNodeRoot;
    private count?: number;
    constructor(readonly data: TrieData, private numNodes?: number) {
        this.root = data.getRoot();
        this._info = mergeOptionalWithDefaults(data.info);
        this.hasForbidden = data.hasForbiddenWords();
        this._findOptionsDefaults = {
            caseInsensitivePrefix: this._info.stripCaseAndAccentsPrefix,
            compoundFix: this._info.compoundCharacter,
            forbidPrefix: this._info.forbiddenWordPrefix,
        };
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

    size(): number {
        this.numNodes ??= countNodes(this.data.getRoot());
        return this.numNodes;
    }

    get info(): Readonly<TrieInfo> {
        return this._info;
    }

    /**
     * @param text - text to find in the Trie
     */
    find(text: string): ITrieNode | undefined {
        const options = this.createFindOptions({ compoundMode: 'compound' });
        return findWordNode(this.data.getRoot(), text, options).node;
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
        return this.hasForbidden && isForbiddenWord(this.root, word, this.info.forbiddenWordPrefix);
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
            opMap((suffix) => text + suffix)
        );
        return pipe(n && n.eow ? [text] : [], opAppend(subNodes));
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
     */
    words(): Iterable<string> {
        return iteratorTrieWords(this.root);
    }

    /**
     * Allows iteration over the entire tree.
     * On the returned Iterator, calling .next(goDeeper: boolean), allows for controlling the depth.
     */
    iterate(): WalkerIterator {
        return walker(this.root);
    }

    static create(words: Iterable<string> | IterableIterator<string>, options?: PartialTrieInfo): ITrie {
        const root = TrieNodeTrie.createFromWords(words, options);
        return new ITrie(root, undefined);
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
