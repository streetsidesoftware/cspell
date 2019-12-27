import { Sequence, genSequence } from 'gensequence';
import * as HR from 'hunspell-reader';
import * as fs from 'fs-extra';
import { Trie, importTrie } from 'cspell-trie-lib';
import * as zlib from 'zlib';
import { AffWordFlags } from 'hunspell-reader/dist/aff';

const regHunspellFile = /\.(dic|aff)$/i;

export interface ReaderOptions {
    maxDepth?: number;
}

type ReaderFn = (filename: string, options: ReaderOptions) => Promise<Reader>;

interface ReaderSelector {
    test: RegExp;
    method: ReaderFn;
}

export interface AnnotatedWord {
    word: string;
    flags: AffWordFlags;
    dicEntry: string;
}

export interface Reader {
    size: number;
    [Symbol.iterator]: () => Sequence<string>;
    annotatedWords: () => Sequence<AnnotatedWord>;
}

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: trieFileReader },
    { test: regHunspellFile, method: readHunspellFiles },
];

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<Reader> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    return {
        size: reader.dic.length,
        [Symbol.iterator]: () => genSequence(reader),
        annotatedWords() { return reader.seqAffWords().map(({word, flags, dic}) => ({ word, flags, dicEntry: dic })); }
    };
}

async function trieFileReader(filename: string): Promise<Reader> {
    const trieRoot = importTrie(await textFileReader(filename));
    const trie = new Trie(trieRoot);
    return {
        get size() { return trie.size(); },
        [Symbol.iterator]: () => trie.words(),
        annotatedWords() { return trie.words().map(w => ({ word: w, flags: {}, dicEntry: w })); }
    };
}

async function textFileReader(filename: string): Promise<Reader> {
    const content = await fs.readFile(filename)
        .then(buffer => (/\.gz$/).test(filename) ? zlib.gunzipSync(buffer) : buffer)
        .then(buffer => buffer.toString('UTF-8'))
        ;
    const lines = content.split('\n');
    return {
        size: lines.length,
        [Symbol.iterator]: () => genSequence(lines),
        annotatedWords() { return genSequence(lines).map(w => ({ word: w, flags: {}, dicEntry: w })); }
    };
}

export function createReader(filename: string, options: ReaderOptions): Promise<Reader> {
    for (const reader of readers) {
        if (reader.test.test(filename)) {
            return reader.method(filename, options);
        }
    }
    return textFileReader(filename);
}
