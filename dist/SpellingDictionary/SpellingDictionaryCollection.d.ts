import { SpellingDictionary } from './SpellingDictionary';
import { SuggestionResult } from './suggest';
import * as Rx from 'rxjs/Rx';
export declare class SpellingDictionaryCollection implements SpellingDictionary {
    readonly dictionaries: SpellingDictionary[];
    constructor(dictionaries: SpellingDictionary[]);
    has(word: string): boolean;
    suggest(word: string, numSuggestions: number): SuggestionResult[];
    readonly size: number;
}
export declare function createCollection(dictionaries: SpellingDictionary[]): SpellingDictionaryCollection;
export declare function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string): boolean;
export declare function makeSuggestions(dicts: SpellingDictionary[], word: string, numSuggestions: number): SuggestionResult[];
export declare function createCollectionRx(wordLists: Rx.Observable<string>[]): Promise<SpellingDictionaryCollection>;
export declare function createCollectionP(dicts: Promise<SpellingDictionary>[]): Promise<SpellingDictionaryCollection>;
