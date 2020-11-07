import { Sequence } from 'gensequence';
import { writeToFileIterableP } from 'cspell-io';
export { writeToFile, writeToFileIterableP, writeToFileIterable } from 'cspell-io';

export function writeSeqToFile(seq: Sequence<string>, outFile: string): Promise<void> {
    return writeToFileIterableP(outFile, seq);
}
