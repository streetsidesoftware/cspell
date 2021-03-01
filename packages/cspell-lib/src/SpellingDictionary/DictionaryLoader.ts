import { createSpellingDictionaryTrie } from './SpellingDictionaryFromTrie';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionary } from './SpellingDictionary';
import * as path from 'path';
import { readLines } from '../util/fileReader';
import { stat } from 'fs-extra';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { DictionaryDefinitionPreferred } from '@cspell/cspell-types';

const MAX_AGE = 10000;

const loaders: Loaders = {
    S: loadSimpleWordList,
    C: loadSimpleWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};

export type LoadOptions = DictionaryDefinitionPreferred;

interface CacheEntry {
    uri: string;
    options: LoadOptions;
    ts: number;
    state: Promise<Stats | Error>;
    dictionary: Promise<SpellingDictionary>;
}

export type LoaderType = keyof Loaders;
export type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;

export interface Loaders {
    S: Loader;
    C: Loader;
    T: Loader;
    default: Loader;
}

const dictionaryCache = new Map<string, CacheEntry>();

export function loadDictionary(uri: string, options: DictionaryDefinitionPreferred): Promise<SpellingDictionary> {
    const key = calcKey(uri);
    const entry = dictionaryCache.get(key);
    if (entry) {
        return entry.dictionary;
    }
    const loadedEntry = loadEntry(uri, options);
    dictionaryCache.set(key, loadedEntry);
    return loadedEntry.dictionary;
}

function calcKey(uri: string) {
    const loaderType = determineType(uri);
    return [uri, loaderType].join('|');
}

/**
 * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
 * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
 * @param now - optional timestamp representing now. (Mostly used in testing)
 */
export async function refreshCacheEntries(maxAge = MAX_AGE, now = Date.now()): Promise<void> {
    await Promise.all([...dictionaryCache].map(([, entry]) => refreshEntry(entry, maxAge, now)));
}

async function refreshEntry(entry: CacheEntry, maxAge: number, now: number): Promise<void> {
    if (now - entry.ts >= maxAge) {
        // Write to the ts, so the next one will not do it.
        entry.ts = now;
        const pStat = stat(entry.uri).catch((e) => e as Error);
        const [state, oldState] = await Promise.all([pStat, entry.state]);
        if (entry.ts === now && !isEqual(state, oldState)) {
            dictionaryCache.set(calcKey(entry.uri), loadEntry(entry.uri, entry.options));
        }
    }
}

type StatsOrError = Stats | Error;

function isEqual(a: StatsOrError, b: StatsOrError): boolean {
    if (isError(a)) {
        return isError(b) && a.message === b.message && a.name === b.name;
    }
    return !isError(b) && (a.mtimeMs === b.mtimeMs || a.size === b.size);
}

function isError(e: StatsOrError): e is Error {
    const err = e as Partial<Error>;
    return !!(err.name && err.message);
}

function loadEntry(uri: string, options: LoadOptions, now = Date.now()): CacheEntry {
    const dictionary = load(uri, options).catch((e) =>
        createFailedToLoadDictionary(new SpellingDictionaryLoadError(uri, options, e, 'failed to load'))
    );
    return {
        uri,
        options,
        ts: now,
        state: stat(uri).catch((e) => e),
        dictionary,
    };
}

function determineType(uri: string): LoaderType {
    const defType = uri.endsWith('.trie.gz') ? 'T' : uri.endsWith('.txt.gz') ? 'S' : 'S';
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : defType;
}

function load(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const type = determineType(uri);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}

async function loadSimpleWordList(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return createSpellingDictionary(lines, determineName(filename, options), filename, options);
}

async function loadTrie(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return createSpellingDictionaryTrie(lines, determineName(filename, options), filename, options);
}

function determineName(filename: string, options: LoadOptions): string {
    return options.name || path.basename(filename);
}

export const testing = {
    dictionaryCache,
    refreshEntry,
    loadEntry,
    load,
};

/**
 * Copied from the Node definition to avoid a dependency upon a specific version of Node
 */
interface StatsBase<T> {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;

    dev: T;
    ino: T;
    mode: T;
    nlink: T;
    uid: T;
    gid: T;
    rdev: T;
    size: T;
    blksize: T;
    blocks: T;
    atimeMs: T;
    mtimeMs: T;
    ctimeMs: T;
    birthtimeMs: T;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
}

export type Stats = StatsBase<number>;
