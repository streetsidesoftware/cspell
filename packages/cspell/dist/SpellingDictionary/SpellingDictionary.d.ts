import { Observable } from 'rxjs';
import { IterableLike } from '../util/IterableLike';
import { Trie, SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie';
import { ReplaceMap } from '../Settings';
export { CompoundWordsMethod, JOIN_SEPARATOR, SuggestionCollector, suggestionCollector, SuggestionResult, WORD_SEPARATOR, } from 'cspell-trie';
export declare type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;
export interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    has(word: string, useCompounds?: boolean): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
}
export interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
}
export declare class SpellingDictionaryFromSet implements SpellingDictionary {
    readonly words: Set<string>;
    readonly name: string;
    readonly options: SpellingDictionaryOptions;
    readonly source: string;
    private _trie;
    readonly mapWord: (word: string) => string;
    readonly type = "SpellingDictionaryFromSet";
    constructor(words: Set<string>, name: string, options?: SpellingDictionaryOptions, source?: string);
    readonly trie: Trie;
    has(word: string, useCompounds?: boolean): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
    readonly size: number;
}
export declare function createSpellingDictionary(wordList: string[] | IterableLike<string>, name: string, source: string, options?: SpellingDictionaryOptions): SpellingDictionary;
export declare function createSpellingDictionaryRx(words: Observable<string>, name: string, source: string, options?: SpellingDictionaryOptions): Promise<SpellingDictionary>;
export declare class SpellingDictionaryFromTrie implements SpellingDictionary {
    readonly trie: Trie;
    readonly name: string;
    readonly options: SpellingDictionaryOptions;
    readonly source: string;
    static readonly unknownWordsLimit = 1000;
    private _size;
    readonly knownWords: Set<string>;
    readonly unknownWords: Set<string>;
    readonly mapWord: (word: string) => string;
    readonly type = "SpellingDictionaryFromTrie";
    constructor(trie: Trie, name: string, options?: SpellingDictionaryOptions, source?: string);
    readonly size: number;
    has(word: string, useCompounds?: boolean): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, compoundMethod?: CompoundWordsMethod): void;
}
export declare function createSpellingDictionaryTrie(data: Observable<string>, name: string, source: string, options?: SpellingDictionaryOptions): Promise<SpellingDictionary>;
