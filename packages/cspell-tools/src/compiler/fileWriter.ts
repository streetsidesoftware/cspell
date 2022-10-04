import { writeTextLinesToFile } from './writeTextToFile';

export { writeTextLinesToFile as writeToFileIterableP } from './writeTextToFile';

export function writeSeqToFile(seq: Iterable<string>, outFile: string): Promise<void> {
    return writeTextLinesToFile(outFile, seq);
}
