import { Trie } from './Trie';
export interface SuggestionResult {
    word: string;
    cost: number;
}
export declare function suggest(trie: Trie, word: string, numSuggestions?: number): SuggestionResult[];
export declare function suggestA(trie: Trie, word: string, numSuggestions?: number): SuggestionResult[];
export declare function suggestAlt(trie: Trie, word: string, numSuggestions?: number): SuggestionResult[];
