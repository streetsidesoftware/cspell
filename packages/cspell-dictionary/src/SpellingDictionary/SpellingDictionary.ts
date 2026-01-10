import type { DictionaryInformation, ReplaceMap } from '@cspell/cspell-types';
import type { SuggestionCollector, SuggestionResult, WeightMap } from 'cspell-trie-lib';

import type { SuggestOptionsRO } from './SuggestOptions.js';

export type { DictionaryDefinitionInline } from '@cspell/cspell-types';

export interface SearchOptions {
    /**
     * Legacy compounds have been deprecated.
     *
     * @deprecated
     */
    useCompounds?: boolean | number | undefined;
    /**
     * Ignore Case and Accents
     */
    ignoreCase?: boolean | undefined;
}

export type SearchOptionsRO = Readonly<SearchOptions>;

export interface FindOptions extends SearchOptions {
    /**
     * Separate compound words using the specified separator.
     */
    compoundSeparator?: string | undefined;
}

export type FindOptionsRO = Readonly<FindOptions>;

export interface Suggestion {
    word: string;
    isPreferred?: boolean | undefined;
}

export interface PreferredSuggestion extends Suggestion {
    isPreferred: true;
}

export interface FindResult {
    /** the text found, otherwise `false` */
    found: string | false;
    /** `true` if it is considered a forbidden word. */
    forbidden: boolean;
    /** `true` if it is a no-suggest word. */
    noSuggest: boolean;
}

export type HasOptions = SearchOptions;
export type HasOptionsRO = Readonly<HasOptions>;

export type IgnoreCaseOption = boolean;

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap | undefined;

    /**
     * The dictionary is case aware.
     */
    caseSensitive?: boolean | undefined;

    /**
     * This is a NO Suggest dictionary used for words to be ignored.
     */
    noSuggest?: boolean | undefined;

    /**
     * Some dictionaries may contain flagged words that are not valid in the language. These are often
     * words that are used in other languages or might be generated through compounding.
     * This setting allows flagged words to be ignored when checking the dictionary.
     * The effect is similar to the word not being in the dictionary.
     */
    ignoreForbiddenWords?: boolean | undefined;

    /**
     * Extra dictionary information used in improving suggestions
     * based upon locale.
     */
    dictionaryInformation?: DictionaryInformation | undefined;

    /**
     * Strip Case and Accents to allow for case insensitive searches and
     * words without accents.
     *
     * Note: this setting only applies to word lists. It has no-impact on trie
     * dictionaries.
     *
     * @default true
     */
    supportNonStrictSearches?: boolean | undefined;

    /**
     * Turns on legacy word compounds.
     * @deprecated
     */
    useCompounds?: boolean | undefined;

    /**
     * Optional WeightMap used to improve suggestions.
     */
    weightMap?: WeightMap | undefined;
}

export type SpellingDictionaryOptionsRO = Readonly<SpellingDictionaryOptions>;

export interface DictionaryInfo {
    /** The name of the dictionary */
    readonly name: string;
    /** The source, filename or URI */
    readonly source: string;
    /** Options */
    readonly options: SpellingDictionaryOptions;
}

export type MapWordSingleFn = (word: string) => string;
export type MapWordMultipleFn = (word: string) => string[];

export interface SpellingDictionary extends DictionaryInfo {
    readonly type: string;
    readonly containsNoSuggestWords: boolean;
    has(word: string, options?: HasOptionsRO): boolean;
    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, options?: FindOptionsRO): FindResult | undefined;
    /**
     * Checks if a word is forbidden.
     * @param word - word to check.
     */
    isForbidden(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
    /**
     * No Suggest words are considered correct but will not be listed when
     * suggestions are generated.
     * No Suggest words and "Ignored" words are equivalent. Ignored / no suggest words override forbidden words.
     * @param word - word to check
     * @param options - options
     */
    isNoSuggestWord(word: string, options: HasOptionsRO): boolean;
    /**
     * Generate suggestions for a word
     * @param word - word
     * @param suggestOptions - options
     */
    suggest(word: string, suggestOptions?: SuggestOptionsRO): SuggestionResult[];

    getPreferredSuggestions?: (word: string) => PreferredSuggestion[];

    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptionsRO): void;
    mapWord?: MapWordSingleFn | undefined;
    /**
     * Generates all possible word combinations by applying `repMap`.
     * This acts a bit like brace expansions in globs.
     * @param word - the word to map
     * @returns array of adjusted words.
     */
    remapWord?: MapWordMultipleFn | undefined;
    readonly size: number;
    readonly isDictionaryCaseSensitive: boolean;
    getErrors?(): Error[];

    /**
     * Get all the terms in the dictionary, they may be formatted according to the dictionary options.
     * @returns the terms in the dictionary.
     */
    terms?: () => Iterable<string>;
}

export interface SuggestDictionary extends SpellingDictionary {
    getPreferredSuggestions: (word: string) => PreferredSuggestion[];
    /**
     * Determine if the word can appear in a list of suggestions.
     * @param word - word
     * @param ignoreCaseAndAccents - ignore case.
     * @returns true if a word is suggested, otherwise false.
     */
    isSuggestedWord(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
}

export const defaultOptions: SpellingDictionaryOptions = Object.freeze({
    weightMap: undefined,
});
