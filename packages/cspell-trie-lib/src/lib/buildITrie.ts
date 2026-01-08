import type { BuildOptions } from './BuildOptions.ts';
import type { ITrie } from './ITrie.ts';
import { ITrieImpl } from './ITrie.ts';
import type { PartialTrieInfo } from './ITrieNode/TrieInfo.ts';
import { TrieBlobBuilder } from './TrieBlob/TrieBlobBuilder.ts';
import { measurePerf } from './utils/performance.ts';

export function buildITrieFromWords(
    words: Iterable<string>,
    info: PartialTrieInfo = {},
    buildOptions?: BuildOptions,
): ITrie {
    const endPerf = measurePerf('buildITrieFromWords');
    try {
        const builder = new TrieBlobBuilder(info);
        builder.insert(words);
        const tb = builder.build(buildOptions);
        return new ITrieImpl(tb);
    } finally {
        endPerf();
    }
}
