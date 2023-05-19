import type { BuilderCursor } from '../Builder/BuilderCursor.js';
import type { FastTrieBlob } from '../TrieBlob/FastTrieBlob.js';
import { FastTrieBlobBuilder } from '../TrieBlob/FastTrieBlobBuilder.js';
import { importTrie } from './importV3.js';

interface ReduceResults {
    cursor: BuilderCursor;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importFastTrieBlob(srcLines: string[] | Iterable<string> | string): FastTrieBlob {
    return importTrie(new FastTrieBlobBuilder(), srcLines);
}
