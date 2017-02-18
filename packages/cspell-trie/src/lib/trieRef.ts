import { TrieNode } from './TrieNode';

export class RefMap extends Map<string, number> {};
export interface TrieRefNode extends TrieNode {
    r?: RefMap;
}
