import type { BaseReader, Reader, ReaderOptions } from './readers/ReaderOptions.js';
import { readHunspellFiles } from './readers/readHunspellFiles.js';
import { regHunspellFile } from './readers/regHunspellFile.js';
import { textFileReader } from './readers/textFileReader.js';
import { trieFileReader } from './readers/trieFileReader.js';

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
