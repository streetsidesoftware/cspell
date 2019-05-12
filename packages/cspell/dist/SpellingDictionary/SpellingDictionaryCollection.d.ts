import { CompoundWordsMethod, SpellingDictionary, SpellingDictionaryOptions, SuggestionCollector, SuggestionResult } from './SpellingDictionary';
export declare class SpellingDictionaryCollection implements SpellingDictionary {
    readonly dictionaries: SpellingDictionary[];
    readonly name: string;
    readonly options: SpellingDictionaryOptions;
    readonly mapWord: (word: string) => string;
    readonly wordsToFlag: Set<string>;
    readonly type = "SpellingDictionaryCollection";
    readonly source: string;
    constructor(dictionaries: SpellingDictionary[], name: string, wordsToFlag: string[]);
    has(word: string, useCompounds?: boolean): boolean;
    suggest(word: string, numSuggestions: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    readonly size: number;
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): SuggestionCollector;
}
export declare function createCollection(dictionaries: SpellingDictionary[], name: string, wordsToFlag?: string[]): SpellingDictionaryCollection;
export declare function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string, useCompounds?: boolean): boolean;
export declare function createCollectionP(dicts: Promise<SpellingDictionary>[], name: string, wordsToFlag: string[]): Promise<SpellingDictionaryCollection>;
