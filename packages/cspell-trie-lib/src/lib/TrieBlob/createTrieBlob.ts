import type { BuildOptions } from '../BuildOptions.ts';
import type { ITrieNodeRoot } from '../ITrieNode/index.ts';
import type { PartialTrieInfo } from '../ITrieNode/TrieInfo.ts';
import type { Trie } from '../trie.ts';
import type { TrieRoot } from '../TrieNode/TrieNode.ts';
import type { TrieBlob } from './TrieBlob.ts';
import { TrieBlobBuilder } from './TrieBlobBuilder.ts';

export function createTrieBlob(
    words: readonly string[],
    options?: PartialTrieInfo,
    buildOptions?: BuildOptions,
): TrieBlob {
    return TrieBlobBuilder.fromWordList(words, options, buildOptions);
}

export function createTrieBlobFromTrie(trie: Trie, buildOptions?: BuildOptions): TrieBlob {
    return createTrieBlobFromTrieRoot(trie.root, buildOptions);
}

export function createTrieBlobFromTrieRoot(trie: TrieRoot, buildOptions?: BuildOptions): TrieBlob {
    return TrieBlobBuilder.fromTrieRoot(trie, buildOptions);
}

export function createTrieBlobFromITrieRoot(trie: ITrieNodeRoot, buildOptions?: BuildOptions): TrieBlob {
    return TrieBlobBuilder.fromITrieRoot(trie, buildOptions);
}
