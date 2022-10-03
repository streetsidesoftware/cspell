import { writeToFileIterableP } from 'cspell-io';
export { writeToFile, writeToFileIterableP, writeToFileIterable } from 'cspell-io';

export function writeSeqToFile(seq: Iterable<string>, outFile: string): Promise<void> {
    return writeToFileIterableP(outFile, seq);
}
