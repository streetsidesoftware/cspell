import type { ReplaceMap, DictionaryInformation } from '@cspell/cspell-types';
import type { CompoundWordsMethod, SuggestionCollector, SuggestionResult, WeightMap } from 'cspell-trie-lib';

export { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';

export interface SearchOptions {
    useCompounds?: boolean | number | undefined;
    ignoreCase?: boolean | undefined;
}

export interface SuggestOptions {
    /**
     * Compounding Mode.
     * `NONE` is the best option.
     */
    compoundMethod?: CompoundWordsMethod;
    /**
     * The limit on the number of suggestions to generate. If `allowTies` is true, it is possible
     * for more suggestions to be generated.
     */
    numSuggestions?: number;
    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     */
    numChanges?: number;
    /**
     * Allow for case-ingestive checking.
     */
    ignoreCase?: boolean;
    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default false
     */
    includeTies?: boolean;
    /**
     * Maximum amount of time to allow for generating suggestions.
     */
    timeout?: number;
}

export type FindOptions = SearchOptions;

export interface FindResult {
    /** the text found, otherwise `false` */
    found: string | false;
    /** `true` if it is considered a forbidden word. */
    forbidden: boolean;
    /** `true` if it is a no-suggest word. */
    noSuggest: boolean;
}

export type HasOptions = SearchOptions;

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    /**
     * The dictionary is case aware.
     */
    caseSensitive?: boolean;
    noSuggest?: boolean;
    weightMap?: WeightMap | undefined;
    dictionaryInformation?: DictionaryInformation;
    /**
     * Strip Case and Accents to allow for case insensitive searches and
     * words without accents.
     *
     * Note: this setting only applies to word lists. It has no-impact on trie
     * dictionaries.
     *
     * @default true
     */
    supportNonStrictSearches?: boolean;
}

export interface DictionaryInfo {
    /** The name of the dictionary */
    readonly name: string;
    /** The source, filename or URI */
    readonly source: string;
    /** Options */
    readonly options: SpellingDictionaryOptions;
}

export interface SpellingDictionary extends DictionaryInfo {
    readonly type: string;
    readonly containsNoSuggestWords: boolean;
    has(word: string, options?: HasOptions): boolean;
    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, options?: SearchOptions): FindResult | undefined;
    isForbidden(word: string): boolean;
    isNoSuggestWord(word: string, options: HasOptions): boolean;
    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly isDictionaryCaseSensitive: boolean;
    getErrors?(): Error[];
}
