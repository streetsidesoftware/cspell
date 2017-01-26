export declare class TrieMap extends Map<string, TrieNode> {
}
import * as Rx from 'rxjs/Rx';
/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface TrieNode {
    k: number;
    w: string;
    c?: TrieMap;
}
/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface Trie {
    c: TrieMap;
}
/**
 *
 */
export declare function addWordToTrie(trie: Trie, word: string): Trie;
export declare function wordListToTrie(words: string[]): Trie;
export declare function wordsToTrie(words: Rx.Observable<string>): Promise<Trie>;
export declare function createTrie(): Trie;
