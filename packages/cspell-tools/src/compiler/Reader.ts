import type { DictionaryReader, Reader, ReaderOptions } from './readers/ReaderOptions.ts';
import { readHunspellFiles } from './readers/readHunspellFiles.ts';
import { regHunspellFile } from './readers/regHunspellFile.ts';
import { textFileReader } from './readers/textFileReader.ts';
import { trieFileReader } from './readers/trieFileReader.ts';

interface ReaderSelector {
    test: RegExp;
    method: ReaderFn;
}

type ReaderFn = (filename: string, options: ReaderOptions) => Promise<Reader>;

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: trieFileReader },
    { test: regHunspellFile, method: readHunspellFiles },
];

function findMatchingReader(filename: string, options: ReaderOptions): Promise<Reader | DictionaryReader> {
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
