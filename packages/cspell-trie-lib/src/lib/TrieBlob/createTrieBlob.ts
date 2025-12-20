import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { Trie } from '../trie.ts';
import type { TrieRoot } from '../TrieNode/TrieNode.ts';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.ts';
import type { TrieBlob } from './TrieBlob.ts';

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
