import type { ITrie } from './ITrie.ts';
import { ITrieImpl } from './ITrie.ts';
import type { PartialTrieInfo } from './ITrieNode/TrieInfo.ts';
import { FastTrieBlobBuilder } from './TrieBlob/FastTrieBlobBuilder.ts';

export function buildITrieFromWords(words: Iterable<string>, info: PartialTrieInfo = {}, useTrieBlob = true): ITrie {
    const builder = new FastTrieBlobBuilder(info);
    builder.insert(words);
    const ft = builder.build();
    return new ITrieImpl(useTrieBlob ? ft.toTrieBlob() : ft);
}
