import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.js';
import type { Trie } from '../trie.js';
import type { TrieRoot } from '../TrieNode/TrieNode.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';
import type { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: readonly string[], options?: PartialTrieInfo): TrieBlob {
    const ft = FastTrieBlobBuilder.fromWordList(words, options);
    return ft.toTrieBlob();
}

export function createTrieBlobFromTrie(trie: Trie): TrieBlob {
    return FastTrieBlobBuilder.fromTrieRoot(trie.root).toTrieBlob();
}

export function createTrieBlobFromTrieRoot(trie: TrieRoot): TrieBlob {
    return FastTrieBlobBuilder.fromTrieRoot(trie).toTrieBlob();
}
