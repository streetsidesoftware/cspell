import { Sequence, genSequence } from 'gensequence';
import * as HR from 'hunspell-reader';
import * as fs from 'fs-extra';

export * from 'rxjs-stream';
export {rxToStream as observableToStream} from 'rxjs-stream';

const regHunspellFile = /\.(dic|aff)$/i;

export async function readHunspellFiles(filename: string): Promise<Sequence<string>> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);

    return genSequence(reader);
}

async function iterateFile(filename: string): Promise<Sequence<string>> {
    const content = await fs.readFile(filename, 'utf8');
    return genSequence(content.split('\n'));
}

export function streamWordsFromFile(filename: string): Promise<Sequence<string>> {
    return regHunspellFile.test(filename) ? readHunspellFiles(filename) : iterateFile(filename);
}
