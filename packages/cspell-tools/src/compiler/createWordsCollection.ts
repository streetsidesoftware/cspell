import { parseDictionary } from 'cspell-trie-lib';

import type { FilePath, FilePathOrFilePathArray } from '../config/config.ts';
import { createReader } from './Reader.ts';
import type { DictionaryReader, Reader } from './readers/ReaderOptions.ts';
import { lowerCase } from './text.ts';
import type { AllowedSplitWordsCollection, ExcludeWordsCollection, WordsCollection } from './WordsCollection.ts';
import { defaultAllowedSplitWords, defaultExcludeWordsCollection } from './WordsCollection.ts';

class AllowedSplitWordsImpl implements AllowedSplitWordsCollection {
    private collection: WordsCollection;
    readonly size: number;

    constructor(collection: WordsCollection) {
        this.collection = collection;
        this.size = collection.size;
    }

    public has(word: string, caseSensitive: boolean) {
        return !this.size || this.collection.has(word, caseSensitive);
    }
}

export async function createAllowedSplitWordsFromFiles(
    files: FilePathOrFilePathArray | undefined,
    locale?: string | undefined,
): Promise<AllowedSplitWordsCollection> {
    if (!files || !files.length) return defaultAllowedSplitWords;

    const collection = await createWordsCollectionFromFiles(files, locale);
    return new AllowedSplitWordsImpl(collection);
}

export function createAllowedSplitWords(words: Iterable<string> | undefined): AllowedSplitWordsCollection {
    if (!words) return defaultAllowedSplitWords;

    return new AllowedSplitWordsImpl(createWordsCollection(words));
}

function buildHasFn(dict: { hasWord: (word: string, caseSensitive: boolean) => boolean }, locale: string | undefined) {
    function has(word: string, caseSensitive: boolean) {
        const r = dict.hasWord(word, true);
        if (r || caseSensitive) return r;
        const lc = lowerCase(word, locale);
        if (lc === word) return false;
        return dict.hasWord(lc, true);
    }

    return has;
}

async function readFile(filename: string): Promise<Reader> {
    return await createReader(filename, {});
}

function readersToCollection(readers: Reader[], locale: string | undefined): WordsCollection {
    const dictReaders = readers.filter(isDictionaryReader).map((reader) => dictReaderToCollection(reader, locale));
    const nonDictCollection = lineReadersToCollection(
        readers.filter((a) => !isDictionaryReader(a)),
        locale,
    );
    const collections = [...dictReaders, nonDictCollection];

    const collection = {
        size: collections.reduce((s, a) => s + a.size, 0),
        has: (word: string, caseSensitive: boolean) => collections.some((a) => a.has(word, caseSensitive)),
    };

    return collection;
}

const cache = new WeakMap<FilePath[], Map<string | undefined, WordsCollection>>();

export async function createWordsCollectionFromFiles(
    files: FilePathOrFilePathArray,
    locale?: string | undefined,
): Promise<WordsCollection> {
    files = toFilePathArray(files);

    const byLocale = cache.get(files) ?? new Map<string | undefined, WordsCollection>();
    const cached = byLocale.get(locale);
    if (cached) return cached;

    const sources = await Promise.all(files.map((file) => readFile(file)));

    const collection = readersToCollection(sources, locale);

    byLocale.set(locale, collection);
    cache.set(files, byLocale);
    return collection;
}

export function createWordsCollection(words: Iterable<string>): WordsCollection {
    if (words instanceof Set) return words;

    const arrWords = (Array.isArray(words) ? words : [...words])
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter((a) => !a.startsWith('#'));
    const setOfWords = new Set(arrWords);
    const has = buildHasFn({ hasWord: (word: string) => setOfWords.has(word) }, undefined);
    return { size: setOfWords.size, has };
}

class ExcludeWordsCollectionImpl implements ExcludeWordsCollection {
    private collection: WordsCollection;
    readonly size: number;

    constructor(collection: WordsCollection) {
        this.collection = collection;
        this.size = collection.size;
    }

    public has(word: string, caseSensitive: boolean) {
        return this.collection.has(word, caseSensitive);
    }
}

export async function createExcludeWordsCollectionFromFiles(
    files: FilePathOrFilePathArray | undefined,
): Promise<ExcludeWordsCollection> {
    if (!files || !files.length) return defaultExcludeWordsCollection;

    const collection = await createWordsCollectionFromFiles(files);
    return new ExcludeWordsCollectionImpl(collection);
}

export function createExcludeWordsCollection(words: Iterable<string> | undefined): ExcludeWordsCollection {
    return new ExcludeWordsCollectionImpl(words ? createWordsCollection(words) : new Set());
}

function isDictionaryReader(reader: Reader | DictionaryReader): reader is DictionaryReader {
    return 'hasWord' in reader && !!reader.hasWord;
}

function dictReaderToCollection(reader: DictionaryReader, locale: string | undefined): WordsCollection {
    return { size: reader.size, has: buildHasFn(reader, locale) };
}

function lineReadersToCollection(readers: Reader[], locale: string | undefined): WordsCollection {
    function* words() {
        for (const reader of readers) {
            yield* reader.lines;
        }
    }

    const dict = parseDictionary(words(), { stripCaseAndAccents: false });

    return { size: dict.size, has: buildHasFn(dict, locale) };
}

export function toFilePathArray(filePathOrArray: FilePathOrFilePathArray): FilePath[] {
    return Array.isArray(filePathOrArray) ? filePathOrArray : [filePathOrArray];
}
