import type { ITrieNodeRoot } from '../ITrieNode/index.ts';
import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { Trie } from '../trie.ts';
import { trieRootToITrieRoot } from '../TrieNode/trie.ts';
import type { TrieRoot } from '../TrieNode/TrieNode.ts';
import type { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function createTrieBlob(words: readonly string[], options?: PartialTrieInfo, optimize?: boolean): TrieBlob {
    return TrieBlobBuilder.fromWordList(words, options, optimize);
}

export function createTrieBlobFromTrie(trie: Trie, optimize?: boolean): TrieBlob {
    return createTrieBlobFromITrieRoot(trieRootToITrieRoot(trie.root), optimize);
}

export function createTrieBlobFromTrieRoot(trie: TrieRoot, optimize?: boolean): TrieBlob {
    return createTrieBlobFromITrieRoot(trieRootToITrieRoot(trie), optimize);
}

export function createTrieBlobFromITrieRoot(trie: ITrieNodeRoot, optimize?: boolean): TrieBlob {
    return TrieBlobBuilder.fromITrieRoot(trie, optimize);
}
