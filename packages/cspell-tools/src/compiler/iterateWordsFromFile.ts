import { Sequence, genSequence } from 'gensequence';
import * as HR from 'hunspell-reader';
import * as fs from 'fs-extra';

const regHunspellFile = /\.(dic|aff)$/i;

export interface HunspellOptions {
    maxDepth?: number;
}

export async function readHunspellFiles(filename: string, options: HunspellOptions): Promise<Sequence<string>> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    return genSequence(reader);
}

async function iterateFile(filename: string): Promise<Sequence<string>> {
    const content = await fs.readFile(filename, 'utf8');
    return genSequence(content.split('\n'));
}

export function streamWordsFromFile(filename: string, options: HunspellOptions): Promise<Sequence<string>> {
    return regHunspellFile.test(filename) ? readHunspellFiles(filename, options) : iterateFile(filename);
}
