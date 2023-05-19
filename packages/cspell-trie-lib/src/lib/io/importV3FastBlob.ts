import type { BuilderCursor } from '../Builder/BuilderCursor.js';
import type { FastTrieBlob } from '../TrieBlob/FastTrieBlob.js';
import { FastTrieBlobBuilder } from '../TrieBlob/FastTrieBlobBuilder.js';
import { importTrieV3WithBuilder } from './importV3.js';

interface ReduceResults {
    cursor: BuilderCursor;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importTrieV3AsFastTrieBlob(srcLines: string[] | Iterable<string> | string): FastTrieBlob {
    return importTrieV3WithBuilder(new FastTrieBlobBuilder(), srcLines);
}
