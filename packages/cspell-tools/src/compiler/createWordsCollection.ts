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

export async function createAllowedSplitWords(
    files: FilePath | FilePath[] | undefined
): Promise<AllowedSplitWordsCollection> {
    if (!files || !files.length) return defaultAllowedSplitWords;

    const collection = await createWordsCollection(files);
    return new AllowedSplitWordsImpl(collection);
}

async function readFile(filename: string) {
    const reader = await createReader(filename, {});
    return [...reader];
}

const cache = new WeakMap<FilePath[], WordsCollection>();

export async function createWordsCollection(files: FilePath | FilePath[]): Promise<WordsCollection> {
    files = Array.isArray(files) ? files : [files];

    const cached = cache.get(files);
    if (cached) return cached;

    const sources = await Promise.all(files.map((file) => readFile(file)));

    const collection = new Set(
        sources
            .flatMap((a) => a)
            .map((a) => a.trim())
            .filter((a) => !!a)
            .filter((a) => !a.startsWith('#'))
    );

    cache.set(files, collection);
    return collection;
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

export async function createExcludeWordsCollection(
    files: FilePath | FilePath[] | undefined
): Promise<ExcludeWordsCollection> {
    if (!files || !files.length) return defaultExcludeWordsCollection;

    const collection = await createWordsCollection(files);
    return new ExcludeWordsCollectionImpl(collection);
}
