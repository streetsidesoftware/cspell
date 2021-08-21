import { SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
import { ReplaceMap } from '@cspell/cspell-types';

export { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';

export interface SearchOptions {
    useCompounds?: boolean | number;
    ignoreCase?: boolean;
}

export interface SuggestOptions {
    compoundMethod?: CompoundWordsMethod;
    numSuggestions?: number;
    numChanges?: number;
    ignoreCase?: boolean;
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
    caseSensitive?: boolean;
    noSuggest?: boolean;
}

export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
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
    readonly options: SpellingDictionaryOptions;
    readonly isDictionaryCaseSensitive: boolean;
    getErrors?(): Error[];
}
