import { Sequence, genSequence } from 'gensequence';
import * as HR from 'hunspell-reader';
import * as fs from 'fs-extra';
import { Trie, importTrie } from 'cspell-trie-lib';
import * as zlib from 'zlib';

const regHunspellFile = /\.(dic|aff)$/i;

export interface ReaderOptions {
    maxDepth?: number;
}

type Reader = (filename: string, options: ReaderOptions) => Promise<Sequence<string>>;

interface ReaderSelector {
    test: RegExp;
    method: Reader;
}

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: iterateTrieFile },
    { test: regHunspellFile, method: readHunspellFiles },
];

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<Sequence<string>> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    return genSequence(reader);
}

async function iterateTrieFile(filename: string): Promise<Sequence<string>> {
    const trieRoot = importTrie(await iterateFile(filename));
    const trie = new Trie(trieRoot);
    return trie.words();
}

async function iterateFile(filename: string): Promise<Sequence<string>> {
    const content = await fs.readFile(filename)
        .then(buffer => (/\.gz$/).test(filename) ? zlib.gunzipSync(buffer) : buffer)
        .then(buffer => buffer.toString('UTF-8'))
        ;
    return genSequence(content.split('\n'));
}

export function streamWordsFromFile(filename: string, options: ReaderOptions): Promise<Sequence<string>> {
    for (const reader of readers) {
        if (reader.test.test(filename)) {
            return reader.method(filename, options);
        }
    }
    return iterateFile(filename);
}
