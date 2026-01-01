import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { Trie } from '../trie.ts';
import type { TrieRoot } from '../TrieNode/TrieNode.ts';
import type { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function createTrieBlob(words: readonly string[], options?: PartialTrieInfo): TrieBlob {
    return TrieBlobBuilder.fromWordList(words, options);
}

export function createTrieBlobFromTrie(trie: Trie): TrieBlob {
    return TrieBlobBuilder.fromTrieRoot(trie.root);
}

export function createTrieBlobFromTrieRoot(trie: TrieRoot): TrieBlob {
    return TrieBlobBuilder.fromTrieRoot(trie);
}
