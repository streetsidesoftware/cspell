import type { ITrie } from './ITrie.js';
import { ITrieImpl } from './ITrie.js';
import type { PartialTrieInfo } from './ITrieNode/TrieInfo.js';
import { FastTrieBlobBuilder } from './TrieBlob/FastTrieBlobBuilder.js';

export function buildITrieFromWords(words: Iterable<string>, info: PartialTrieInfo = {}): ITrie {
    const builder = new FastTrieBlobBuilder(info);
    builder.insert(words);
    return new ITrieImpl(builder.build());
}
