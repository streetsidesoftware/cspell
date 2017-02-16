import { TrieNode } from './trie';

export class RefMap extends Map<string, number> {};
export interface TrieRefNode extends TrieNode {
    r?: RefMap;
}
