import { mergeOptionalWithDefaults } from '../index.js';
import type { TrieOptions } from '../trie.js';
import type { TrieData } from '../TrieData.js';
import { trieRootToITrieRoot } from './trie.js';
import { iteratorTrieWords } from './trie-util.js';
import type { TrieRoot } from './TrieNode.js';

export class TrieNodeTrie implements TrieData {
    readonly options: TrieOptions;
    constructor(readonly root: TrieRoot) {
        this.options = mergeOptionalWithDefaults(root);
    }

    get iTrieRoot() {
        return trieRootToITrieRoot(this.root);
    }

    words(): Iterable<string> {
        return iteratorTrieWords(this.root);
    }
}
