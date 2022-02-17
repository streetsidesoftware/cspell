import type { DictionaryFileTypes } from '@cspell/cspell-types';
import { stat } from 'fs-extra';
import { genSequence } from 'gensequence';
import * as path from 'path';
import { DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef';
import { readLines, readLinesSync } from '../util/fileReader';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionary } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { createSpellingDictionaryTrie } from './SpellingDictionaryFromTrie';
import { format } from 'util';

const MAX_AGE = 10000;

const loaders: Loaders = {
    S: loadSimpleWordList,
    C: legacyWordList,
    W: wordsPerLineWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};

const loadersSync: SyncLoaders = {
    S: loadSimpleWordListSync,
    C: legacyWordListSync,
    W: wordsPerLineWordListSync,
    T: loadTrieSync,
    default: loadSimpleWordListSync,
};

export type LoadOptions = DictionaryDefinitionInternal;

interface CacheEntry {
    uri: string;
    options: LoadOptions;
    ts: number;
    state: Promise<Stats | Error>;
    pDictionary: Promise<SpellingDictionary>;
    dictionary: SpellingDictionary | undefined;
}

interface CacheEntrySync extends CacheEntry {
    dictionary: SpellingDictionary;
}

export type LoaderType = keyof Loaders;
export type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;
export type LoaderSync = (filename: string, options: LoadOptions) => SpellingDictionary;

export interface Loaders {
    S: Loader;
    C: Loader;
    T: Loader;
    W: Loader;
    default: Loader;
}

export interface SyncLoaders {
    S: LoaderSync;
    C: LoaderSync;
    T: LoaderSync;
    W: LoaderSync;
    default: LoaderSync;
}

const dictionaryCache = new Map<string, CacheEntry>();

export function loadDictionary(uri: string, options: DictionaryDefinitionInternal): Promise<SpellingDictionary> {
    const key = calcKey(uri, options);
    const entry = dictionaryCache.get(key);
    if (entry) {
        return entry.pDictionary;
    }
    const loadedEntry = loadEntry(uri, options);
    dictionaryCache.set(key, loadedEntry);
    return loadedEntry.pDictionary;
}

export function loadDictionarySync(uri: string, options: DictionaryDefinitionInternal): SpellingDictionary {
    const key = calcKey(uri, options);
    const entry = dictionaryCache.get(key);
    if (entry?.dictionary) {
        return entry.dictionary;
    }
    const loadedEntry = loadEntrySync(uri, options);
    dictionaryCache.set(key, loadedEntry);
    return loadedEntry.dictionary;
}

const importantOptionKeys: (keyof DictionaryDefinitionInternal)[] = ['name', 'noSuggest', 'useCompounds'];

function calcKey(uri: string, options: DictionaryDefinitionInternal) {
    const loaderType = determineType(uri, options);
    const optValues = importantOptionKeys.map((k) => options[k]?.toString() || '');
    const parts = [uri, loaderType].concat(optValues);

    return parts.join('|');
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
            dictionaryCache.set(calcKey(entry.uri, entry.options), loadEntry(entry.uri, entry.options));
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
    const entry: CacheEntry = {
        uri,
        options,
        ts: now,
        state: stat(uri).catch((e) => e),
        pDictionary: dictionary.then((d) => ((entry.dictionary = d), d)),
        dictionary: undefined,
    };
    return entry;
}

function loadEntrySync(uri: string, options: LoadOptions, now = Date.now()): CacheEntrySync {
    try {
        const dictionary = loadSync(uri, options);
        return {
            uri,
            options,
            ts: now,
            state: stat(uri).catch((e) => e),
            pDictionary: Promise.resolve(dictionary),
            dictionary,
        };
    } catch (e) {
        const error = e instanceof Error ? e : new Error(format(e));
        const dictionary = createFailedToLoadDictionary(
            new SpellingDictionaryLoadError(uri, options, error, 'failed to load')
        );
        return {
            uri,
            options,
            ts: now,
            state: stat(uri).catch((e) => e),
            pDictionary: Promise.resolve(dictionary),
            dictionary,
        };
    }
}

function determineType(uri: string, opts: Pick<LoadOptions, 'type'>): LoaderType {
    const t: DictionaryFileTypes = (opts.type && opts.type in loaders && opts.type) || 'S';
    const defLoaderType: LoaderType = t;
    const defType = uri.endsWith('.trie.gz') ? 'T' : uri.endsWith('.txt.gz') ? defLoaderType : defLoaderType;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : defType;
}

function load(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}

function loadSync(uri: string, options: LoadOptions): SpellingDictionary {
    const type = determineType(uri, options);
    const loader = loadersSync[type] || loaders.default;
    return loader(uri, options);
}

async function legacyWordList(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return _legacyWordListSync(lines, filename, options);
}

function legacyWordListSync(filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return _legacyWordListSync(lines, filename, options);
}

function _legacyWordListSync(lines: Iterable<string>, filename: string, options: LoadOptions) {
    const words = genSequence(lines)
        // Remove comments
        .map((line) => line.replace(/#.*/g, ''))
        // Split on everything else
        .concatMap((line) => line.split(/[^\w\p{L}\p{M}'’]+/gu))
        .filter((word) => !!word);
    return createSpellingDictionary(words, determineName(filename, options), filename, options);
}

async function wordsPerLineWordList(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return _wordsPerLineWordList(lines, filename, options);
}

function wordsPerLineWordListSync(filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return _wordsPerLineWordList(lines, filename, options);
}

function _wordsPerLineWordList(lines: Iterable<string>, filename: string, options: LoadOptions) {
    const words = genSequence(lines)
        // Remove comments
        .map((line) => line.replace(/#.*/g, ''))
        // Split on everything else
        .concatMap((line) => line.split(/\s+/gu))
        .filter((word) => !!word);
    return createSpellingDictionary(words, determineName(filename, options), filename, options);
}

async function loadSimpleWordList(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return createSpellingDictionary(lines, determineName(filename, options), filename, options);
}

function loadSimpleWordListSync(filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return createSpellingDictionary(lines, determineName(filename, options), filename, options);
}

async function loadTrie(filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return createSpellingDictionaryTrie(lines, determineName(filename, options), filename, options);
}

function loadTrieSync(filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
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
