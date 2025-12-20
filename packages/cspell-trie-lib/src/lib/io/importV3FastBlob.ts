import type { BuilderCursor } from '../Builder/BuilderCursor.ts';
import type { FastTrieBlob } from '../TrieBlob/FastTrieBlob.ts';
import { FastTrieBlobBuilder } from '../TrieBlob/FastTrieBlobBuilder.ts';
import { importTrieV3WithBuilder } from './importV3.ts';

interface ReduceResults {
    cursor: BuilderCursor;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importTrieV3AsFastTrieBlob(srcLines: string[] | Iterable<string> | string): FastTrieBlob {
    return importTrieV3WithBuilder(new FastTrieBlobBuilder(), srcLines);
}
