import { splitLineIntoWords, splitLineIntoCodeWords, loadWordsNoError } from '../wordListHelper';
import { SpellingDictionary, createSpellingDictionaryTrie, createSpellingDictionary } from './SpellingDictionary';
import * as path from 'path';
import { ReplaceMap } from '../Settings';
import { genSequence } from 'gensequence';
import { readLines } from '../util/fileReader';
import { Stats } from 'fs-extra';
import * as fs from 'fs-extra';

const MAX_AGE = 10000;

export interface LoadOptions {
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: LoaderType;
    // Replacement Map
    repMap?: ReplaceMap;
    // Use Compounds
    useCompounds?: boolean;
}

export type LoaderType = keyof Loaders;
export type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;

export interface Loaders {
    S: Loader;
    W: Loader;
    C: Loader;
    T: Loader;
    default: Loader;
    [index: string]: Loader | undefined;
}

const loaders: Loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};

interface CacheEntry {
    uri: string;
    options: LoadOptions;
    ts: number;
    state: Promise<Stats | undefined>;
    dictionary: Promise<SpellingDictionary>;
}

const dictionaryCache = new Map<string, CacheEntry>();

export function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const key = calcKey(uri, options);
    if (!dictionaryCache.has(key)) {
        dictionaryCache.set(key, loadEntry(uri, options));
    }
    const entry = dictionaryCache.get(key)!;
    return entry.dictionary;
}

function calcKey(uri: string, options: LoadOptions) {
    const loaderType = determineType(uri, options);
    return [uri, loaderType].join('|');
}

export async function refreshCacheEntries(maxAge = MAX_AGE, now = Date.now()) {
    await Promise.all([...dictionaryCache]
        .map(([, entry]) => refreshEntry(entry, maxAge, now))
    );
}

async function refreshEntry(entry: CacheEntry, maxAge = MAX_AGE, now = Date.now()) {
    if (now - entry.ts >= maxAge) {
        // Write to the ts, so the next one will not do it.
        entry.ts = now;
        const pStat = fs.stat(entry.uri).catch(() => undefined);
        const [state, oldState] = await Promise.all([pStat, entry.state]);
        if (entry.ts === now && (
            state?.mtimeMs !== oldState?.mtimeMs ||
            state?.size !== oldState?.size
        )) {
            dictionaryCache.set(
                calcKey(entry.uri, entry.options),
                loadEntry(entry.uri, entry.options)
            );
        }
    }
}

function loadEntry(uri: string, options: LoadOptions, now = Date.now()): CacheEntry {
    return {
        uri,
        options,
        ts: now,
        state: fs.stat(uri).catch(() => undefined),
        dictionary: load(uri, options),
    }
}

function determineType(uri: string, options: LoadOptions): LoaderType {
    const defType = uri.endsWith('.trie.gz') ? 'T' : uri.endsWith('.txt.gz') ? 'S' : 'C';
    const { type = defType } = options;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : type;
}

function load(uri: string, options: LoadOptions): Promise<SpellingDictionary>  {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}


async function loadSimpleWordList(filename: string, options: LoadOptions) {
    try {
        const lines = await readLines(filename);
        return createSpellingDictionary(lines, path.basename(filename), filename, options);
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadWordList(filename: string, options: LoadOptions) {
    try {
        const lines = genSequence(await readLines(filename));
        const words = lines.concatMap(splitLineIntoWords);
        return createSpellingDictionary(words, path.basename(filename), filename, options);
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadCodeWordList(filename: string, options: LoadOptions) {
    try {
        const lines = genSequence(await readLines(filename));
        const words = lines.concatMap(splitLineIntoCodeWords);
        return createSpellingDictionary(words, path.basename(filename), filename, options);
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadTrie(filename: string, options: LoadOptions) {
    return createSpellingDictionaryTrie(await loadWordsNoError(filename), path.basename(filename), filename, options);
}

export const testing = {
    dictionaryCache,
    refreshEntry,
    loadEntry
};
