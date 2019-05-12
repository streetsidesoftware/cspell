import { Trie, WalkerIterator } from 'cspell-trie';
import { SuggestionResult } from './entities';
export interface SuggestionIterator extends IterableIterator<SuggestionResult> {
    /**
     * Ask for the next result.
     * minValue - is used to filter out all suggestions with a matching value less than minValue
     */
    next: (minValue: number) => IteratorResult<SuggestionResult>;
    [Symbol.iterator]: () => SuggestionIterator;
}
export declare function suggest(trie: Trie, word: string, minScore?: number): SuggestionIterator;
export declare function suggestIteration(i: WalkerIterator, word: string, minScore?: number): SuggestionIterator;
