import type { BuilderCursor } from '../Builder/BuilderCursor.ts';
import type { TrieBlob } from '../TrieBlob/index.ts';
import { TrieBlobBuilder } from '../TrieBlob/TrieBlobBuilder.ts';
import { importTrieV3WithBuilder } from './importV3.ts';

interface ReduceResults {
    cursor: BuilderCursor;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importTrieV3AsTrieBlob(srcLines: string[] | Iterable<string> | string): TrieBlob {
    return importTrieV3WithBuilder(new TrieBlobBuilder(), srcLines);
}
