import type { DictionaryFileTypes } from '@cspell/cspell-types';
import { promises as fs, statSync } from 'fs';
import { genSequence } from 'gensequence';
import * as path from 'path';
import { format } from 'util';
import { DictionaryDefinitionInternal } from '../Models/CSpellSettingsInternalDef';
import { isErrnoException } from '../util/errors';
import { readLines, readLinesSync } from '../util/fileReader';
import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionary } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { createSpellingDictionaryTrie } from './SpellingDictionaryFromTrie';

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

enum LoadingState {
    Loaded = 0,
    Loading = 1,
}

interface CacheEntry {
    uri: string;
    options: LoadOptions;
    ts: number;
    stat: Stats | Error | undefined;
    dictionary: SpellingDictionary | undefined;
    pending: Promise<readonly [SpellingDictionary, Stats | Error]>;
    loadingState: LoadingState;
    sig: number;
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
        return entry.pending.then(([dictionary]) => dictionary);
    }
    const loadedEntry = loadEntry(uri, options);
    dictionaryCache.set(key, loadedEntry);
    return loadedEntry.pending.then(([dictionary]) => dictionary);
}

export function loadDictionarySync(uri: string, options: DictionaryDefinitionInternal): SpellingDictionary {
    const key = calcKey(uri, options);
    const entry = dictionaryCache.get(key);
    if (entry?.dictionary && entry.loadingState === LoadingState.Loaded) {
        if (entry.options.name === 'temp') {
            console.log(
                `Cache Found ${entry.options.name}; ts: ${entry.sig.toFixed(2)}; file: ${path.relative(
                    process.cwd(),
                    entry.uri
                )}`
            );
        }
        return entry.dictionary;
    }
    const loadedEntry = loadEntrySync(uri, options);
    dictionaryCache.set(key, loadedEntry);
    return loadedEntry.dictionary;
}

const importantOptionKeys: (keyof DictionaryDefinitionInternal)[] = ['name', 'noSuggest', 'useCompounds', 'type'];

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
    await Promise.all([...dictionaryCache.values()].map((entry) => refreshEntry(entry, maxAge, now)));
}

async function refreshEntry(entry: CacheEntry, maxAge: number, now: number): Promise<void> {
    if (now - entry.ts >= maxAge) {
        const sig = now + Math.random();
        // Write to the ts, so the next one will not do it.
        entry.sig = sig;
        entry.ts = now;
        const pStat = getStat(entry.uri);
        const [newStat] = await Promise.all([pStat, entry.pending]);
        const hasChanged = !isEqual(newStat, entry.stat);
        const sigMatches = entry.sig === sig;
        if (entry.options.name === 'temp') {
            const processedAt = Date.now();
            setTimeout(
                () =>
                    console.log(
                        `Refresh ${entry.options.name}; sig: ${sig.toFixed(
                            2
                        )} at ${processedAt}; Sig Matches: ${sigMatches.toString()}; changed: ${hasChanged.toString()}; file: ${path.relative(
                            process.cwd(),
                            entry.uri
                        )}`
                    ),
                0
            );
        }
        if (sigMatches && hasChanged) {
            entry.loadingState = LoadingState.Loading;
            dictionaryCache.set(calcKey(entry.uri, entry.options), loadEntry(entry.uri, entry.options));
        }
    }
}

type StatsOrError = Stats | Error;

function isEqual(a: StatsOrError, b: StatsOrError | undefined): boolean {
    if (!b) return false;
    if (isError(a)) {
        return isError(b) && a.message === b.message && a.name === b.name;
    }
    return !isError(b) && (a.mtimeMs === b.mtimeMs || a.size === b.size);
}

function isError(e: StatsOrError): e is Error {
    const err = e as Partial<Error>;
    return !!err.message;
}

function loadEntry(uri: string, options: LoadOptions, now = Date.now()): CacheEntry {
    const pDictionary = load(uri, options).catch((e) =>
        createFailedToLoadDictionary(new SpellingDictionaryLoadError(uri, options, e, 'failed to load'))
    );
    const pStat = getStat(uri);
    const pending = Promise.all([pDictionary, pStat]);
    const sig = now + Math.random();
    const entry: CacheEntry = {
        uri,
        options,
        ts: now,
        stat: undefined,
        dictionary: undefined,
        pending,
        loadingState: LoadingState.Loading,
        sig,
    };
    // eslint-disable-next-line promise/catch-or-return
    pending.then(([dictionary, stat]) => {
        entry.stat = stat;
        entry.dictionary = dictionary;
        entry.loadingState = LoadingState.Loaded;
        return;
    });
    return entry;
}

function loadEntrySync(uri: string, options: LoadOptions, now = Date.now()): CacheEntrySync {
    const stat = getStatSync(uri);
    const sig = now + Math.random();
    try {
        const dictionary = loadSync(uri, options);
        const pending = Promise.resolve([dictionary, stat] as const);
        return {
            uri,
            options,
            ts: now,
            stat,
            dictionary,
            pending,
            loadingState: LoadingState.Loaded,
            sig,
        };
    } catch (e) {
        const error = e instanceof Error ? e : new Error(format(e));
        const dictionary = createFailedToLoadDictionary(
            new SpellingDictionaryLoadError(uri, options, error, 'failed to load')
        );
        const pending = Promise.resolve([dictionary, stat] as const);
        return {
            uri,
            options,
            ts: now,
            stat,
            dictionary,
            pending,
            loadingState: LoadingState.Loaded,
            sig,
        };
    }
}

function determineType(uri: string, opts: Pick<LoadOptions, 'type'>): LoaderType {
    const t: DictionaryFileTypes = (opts.type && opts.type in loaders && opts.type) || 'S';
    const defLoaderType: LoaderType = t;
    const defType = uri.endsWith('.trie.gz') ? 'T' : defLoaderType;
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

function toError(e: unknown): Error {
    if (isErrnoException(e)) return e;
    if (e instanceof Error) return e;
    return new Error(format(e));
}

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

function getStat(uri: string): Promise<Stats | Error> {
    return fs.stat(uri).catch((e) => toError(e));
}

function getStatSync(uri: string): Stats | Error {
    try {
        return statSync(uri);
    } catch (e) {
        return toError(e);
    }
}

export type Stats = StatsBase<number>;
