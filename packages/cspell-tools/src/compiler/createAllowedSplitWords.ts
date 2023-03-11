import type { FilePath } from '../config/config';
import type { AllowedSplitWords } from './AllowedSplitWords';
import { createReader } from './Reader';

class AllowedSplitWordsImpl implements AllowedSplitWords {
    private words: Set<string> | undefined;
    readonly size: number;

    constructor(source: Iterable<string> | undefined) {
        this.words = source && (source instanceof Set ? source : new Set(source));
        this.size = this.words?.size || 0;
    }

    public has(word: string) {
        return !this.words || this.words.has(word);
    }
}

const cache = new WeakMap<FilePath[], AllowedSplitWords>();

export async function createAllowedSplitWords(files: FilePath | FilePath[] | undefined) {
    if (!files || !files.length) return new AllowedSplitWordsImpl(undefined);
    files = Array.isArray(files) ? files : [files];

    const cached = cache.get(files);
    if (cached) return cached;

    const sources = await Promise.all(files.map((file) => readFile(file)));

    const value = new AllowedSplitWordsImpl(sources.flatMap((a) => a).filter((a) => !!a));
    cache.set(files, value);
    return value;
}

async function readFile(filename: string) {
    const reader = await createReader(filename, {});
    return [...reader];
}
