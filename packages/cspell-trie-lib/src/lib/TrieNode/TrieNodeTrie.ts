import { iteratorTrieWords } from './trie-util.js';
import type { TrieRoot } from './TrieNode.js';

export class TrieNodeTrie {
    constructor(readonly root: TrieRoot) {}

    words(): Iterable<string> {
        return iteratorTrieWords(this.root);
    }
}
