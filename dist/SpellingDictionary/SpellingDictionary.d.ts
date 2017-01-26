import { SuggestionResult } from './suggest';
import { Trie } from './Trie';
import { Sequence } from 'gensequence';
import * as Rx from 'rxjs/Rx';
export interface SpellingDictionary {
    has(word: string): boolean;
    suggest(word: string, numSuggestions?: number): SuggestionResult[];
    size: number;
}
export declare class SpellingDictionaryInstance implements SpellingDictionary {
    readonly words: Set<string>;
    readonly trie: Trie;
    constructor(words: Set<string>, trie: Trie);
    has(word: string): boolean;
    suggest(word: string, numSuggestions?: number): SuggestionResult[];
    readonly size: number;
}
export declare function createSpellingDictionary(wordList: string[] | Sequence<string>): SpellingDictionary;
export declare function createSpellingDictionaryRx(words: Rx.Observable<string>): Promise<SpellingDictionary>;
