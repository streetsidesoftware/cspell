import { SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
import { ReplaceMap } from '@cspell/cspell-types';

export {
    CompoundWordsMethod,
    JOIN_SEPARATOR,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    WORD_SEPARATOR,
} from 'cspell-trie-lib';

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

export type HasOptions = boolean | SearchOptions;

export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
}

export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    has(word: string, useCompounds: boolean): boolean;
    has(word: string, options: HasOptions): boolean;
    has(word: string, options?: HasOptions): boolean;
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
