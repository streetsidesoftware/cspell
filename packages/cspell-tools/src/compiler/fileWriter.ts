import { writeTextLinesToFile } from './writeTextToFile.js';

export { writeTextLinesToFile as writeToFileIterableP } from './writeTextToFile.js';

export function writeSeqToFile(seq: Iterable<string>, outFile: string): Promise<void> {
    return writeTextLinesToFile(outFile, seq);
}
