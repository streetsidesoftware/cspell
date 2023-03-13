import type { FilePath } from '../config/config';
import { createReader } from './Reader';
import type { AllowedSplitWordsCollection, ExcludeWordsCollection, WordsCollection } from './WordsCollection';
import { defaultAllowedSplitWords, defaultExcludeWordsCollection } from './WordsCollection';

class AllowedSplitWordsImpl implements AllowedSplitWordsCollection {
    private words: WordsCollection;
    readonly size: number;

    constructor(collection: WordsCollection) {
        this.words = collection;
        this.size = collection.size;
    }

    public has(word: string) {
        return !this.size || this.words.has(word);
    }
}

export async function createAllowedSplitWordsFromFiles(
    files: FilePath | FilePath[] | undefined
): Promise<AllowedSplitWordsCollection> {
    if (!files || !files.length) return defaultAllowedSplitWords;

    const collection = await createWordsCollectionFromFiles(files);
    return new AllowedSplitWordsImpl(collection);
}

export function createAllowedSplitWords(words: Iterable<string> | undefined): AllowedSplitWordsCollection {
    if (!words) return defaultAllowedSplitWords;

    return new AllowedSplitWordsImpl(createWordsCollection(words));
}

async function readFile(filename: string) {
    const reader = await createReader(filename, {});
    return [...reader];
}

const cache = new WeakMap<FilePath[], WordsCollection>();

export async function createWordsCollectionFromFiles(files: FilePath | FilePath[]): Promise<WordsCollection> {
    files = Array.isArray(files) ? files : [files];

    const cached = cache.get(files);
    if (cached) return cached;

    const sources = await Promise.all(files.map((file) => readFile(file)));

    const collection = createWordsCollection(sources.flatMap((a) => a));

    cache.set(files, collection);
    return collection;
}

export function createWordsCollection(words: Iterable<string>): WordsCollection {
    if (words instanceof Set) return words;

    const arrWords = (Array.isArray(words) ? words : [...words])
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter((a) => !a.startsWith('#'));
    return new Set(arrWords);
}

class ExcludeWordsCollectionImpl implements ExcludeWordsCollection {
    private words: WordsCollection;
    readonly size: number;

    constructor(collection: WordsCollection) {
        this.words = collection;
        this.size = collection.size;
    }

    public has(word: string) {
        return this.words.has(word);
    }
}

export async function createExcludeWordsCollectionFromFiles(
    files: FilePath | FilePath[] | undefined
): Promise<ExcludeWordsCollection> {
    if (!files || !files.length) return defaultExcludeWordsCollection;

    const collection = await createWordsCollectionFromFiles(files);
    return new ExcludeWordsCollectionImpl(collection);
}

export function createExcludeWordsCollection(words: Iterable<string> | undefined): ExcludeWordsCollection {
    return new ExcludeWordsCollectionImpl(words ? createWordsCollection(words) : new Set());
}
