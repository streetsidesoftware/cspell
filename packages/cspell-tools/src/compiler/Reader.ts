import type { BaseReader, Reader, ReaderOptions } from './readers/ReaderOptions';
import { readHunspellFiles } from './readers/readHunspellFiles';
import { textFileReader } from './readers/textFileReader';
import { trieFileReader } from './readers/trieFileReader';

export const regHunspellFile = /\.(dic|aff)$/i;

interface ReaderSelector {
    test: RegExp;
    method: ReaderFn;
}

type ReaderFn = (filename: string, options: ReaderOptions) => Promise<BaseReader>;

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: trieFileReader },
    { test: regHunspellFile, method: readHunspellFiles },
];

function findMatchingReader(filename: string, options: ReaderOptions): Promise<BaseReader> {
    for (const reader of readers) {
        if (reader.test.test(filename)) {
            return reader.method(filename, options);
        }
    }
    return textFileReader(filename);
}

export async function createReader(filename: string, options: ReaderOptions): Promise<Reader> {
    const baseReader = await findMatchingReader(filename, options);
    return Object.assign(baseReader, {
        [Symbol.iterator]: () => baseReader.lines[Symbol.iterator](),
    });
}
