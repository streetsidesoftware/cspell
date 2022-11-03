import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { DictionaryFileTypes } from '@cspell/cspell-types';
import {
    createFailedToLoadDictionary,
    createSpellingDictionary,
    createSpellingDictionaryFromTrieFile,
    SpellingDictionary,
} from 'cspell-dictionary';
import { CSpellIO, Stats } from 'cspell-io';
import { DictionaryDefinitionInternal } from '../../Models/CSpellSettingsInternalDef';
import { toError } from '../../util/errors';
import { StrongWeakMap } from '../../util/StrongWeakMap';
import { SpellingDictionaryLoadError } from '../SpellingDictionaryError';

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

type Reader = (filename: string) => Promise<Iterable<string>>;
type ReaderSync = (filename: string) => Iterable<string>;

type LoaderType = keyof Loaders;
type Loader = (reader: Reader, filename: string, options: LoadOptions) => Promise<SpellingDictionary>;
type LoaderSync = (reader: ReaderSync, filename: string, options: LoadOptions) => SpellingDictionary;

interface Loaders {
    S: Loader;
    C: Loader;
    T: Loader;
    W: Loader;
    default: Loader;
}

interface SyncLoaders {
    S: LoaderSync;
    C: LoaderSync;
    T: LoaderSync;
    W: LoaderSync;
    default: LoaderSync;
}

export class DictionaryLoader {
    private dictionaryCache = new StrongWeakMap<string, CacheEntry>();
    private dictionaryCacheByDef = new StrongWeakMap<
        DictionaryDefinitionInternal,
        { key: string; entry: CacheEntry }
    >();
    private reader: Reader;
    private readerSync: ReaderSync;

    constructor(private cspellIO: CSpellIO) {
        this.reader = toReader(cspellIO);
        this.readerSync = toReaderSync(cspellIO);
    }

    public loadDictionary(def: DictionaryDefinitionInternal): Promise<SpellingDictionary> {
        const { key, entry } = this.getCacheEntry(def);
        if (entry) {
            return entry.pending.then(([dictionary]) => dictionary);
        }
        const loadedEntry = this.loadEntry(def.path, def);
        this.setCacheEntry(key, loadedEntry, def);
        return loadedEntry.pending.then(([dictionary]) => dictionary);
    }

    public loadDictionarySync(def: DictionaryDefinitionInternal): SpellingDictionary {
        const { key, entry } = this.getCacheEntry(def);
        if (entry?.dictionary && entry.loadingState === LoadingState.Loaded) {
            return entry.dictionary;
        }
        const loadedEntry = this.loadEntrySync(def.path, def);
        this.setCacheEntry(key, loadedEntry, def);
        return loadedEntry.dictionary;
    }

    /**
     * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
     * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
     * @param now - optional timestamp representing now. (Mostly used in testing)
     */
    public async refreshCacheEntries(maxAge = MAX_AGE, now = Date.now()): Promise<void> {
        await Promise.all([...this.dictionaryCache.values()].map((entry) => this.refreshEntry(entry, maxAge, now)));
    }

    private getCacheEntry(def: DictionaryDefinitionInternal): { key: string; entry: CacheEntry | undefined } {
        const defEntry = this.dictionaryCacheByDef.get(def);
        if (defEntry) {
            return defEntry;
        }
        const key = calcKey(def);
        const entry = this.dictionaryCache.get(key);
        if (entry) {
            // replace old entry so it can be released.
            entry.options = def;
        }
        return { key, entry };
    }

    private setCacheEntry(key: string, entry: CacheEntry, def: DictionaryDefinitionInternal) {
        this.dictionaryCache.set(key, entry);
        this.dictionaryCacheByDef.set(def, { key, entry });
    }

    private async refreshEntry(entry: CacheEntry, maxAge: number, now: number): Promise<void> {
        if (now - entry.ts >= maxAge) {
            const sig = now + Math.random();
            // Write to the ts, so the next one will not do it.
            entry.sig = sig;
            entry.ts = now;
            const pStat = this.getStat(entry.uri);
            const [newStat] = await Promise.all([pStat, entry.pending]);
            const hasChanged = !this.isEqual(newStat, entry.stat);
            const sigMatches = entry.sig === sig;
            if (sigMatches && hasChanged) {
                entry.loadingState = LoadingState.Loading;
                const key = calcKey(entry.options);
                const newEntry = this.loadEntry(entry.uri, entry.options);
                this.dictionaryCache.set(key, newEntry);
                this.dictionaryCacheByDef.set(entry.options, { key, entry: newEntry });
            }
        }
    }

    private loadEntry(uri: string, options: LoadOptions, now = Date.now()): CacheEntry {
        options = this.normalizeOptions(uri, options);
        const pDictionary = load(this.reader, uri, options).catch((e) =>
            createFailedToLoadDictionary(
                options.name,
                uri,
                new SpellingDictionaryLoadError(uri, options, e, 'failed to load'),
                options
            )
        );
        const pStat = this.getStat(uri);
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

    private loadEntrySync(uri: string, options: LoadOptions, now = Date.now()): CacheEntrySync {
        options = this.normalizeOptions(uri, options);
        const stat = this.getStatSync(uri);
        const sig = now + Math.random();
        try {
            const dictionary = loadSync(this.readerSync, uri, options);
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
            const error = toError(e);
            const dictionary = createFailedToLoadDictionary(
                options.name,
                uri,
                new SpellingDictionaryLoadError(uri, options, error, 'failed to load'),
                options
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

    private getStat(uri: string): Promise<StatsOrError> {
        return this.cspellIO.getStat(uri).catch(toError);
    }

    private getStatSync(uri: string): StatsOrError {
        try {
            return this.cspellIO.getStatSync(uri);
        } catch (e) {
            return toError(e);
        }
    }

    private isEqual(a: StatsOrError, b: StatsOrError | undefined): boolean {
        if (!b) return false;
        if (isError(a)) {
            return isError(b) && a.message === b.message && a.name === b.name;
        }
        return !isError(b) && !this.cspellIO.compareStats(a, b);
    }

    private normalizeOptions(uri: string, options: LoadOptions): LoadOptions {
        if (options.name) return options;
        return { ...options, name: this.cspellIO.uriBasename(uri) };
    }
}

function toReader(cspellIO: CSpellIO): Reader {
    return async function (filename: string) {
        const res = await cspellIO.readFile(filename);
        return res.content.split(/\n|\r\n|\r/);
    };
}

function toReaderSync(cspellIO: CSpellIO): ReaderSync {
    return function (filename: string) {
        const res = cspellIO.readFileSync(filename);
        return res.content.split(/\n|\r\n|\r/);
    };
}

const importantOptionKeys: (keyof DictionaryDefinitionInternal)[] = ['name', 'noSuggest', 'useCompounds', 'type'];

function calcKey(def: DictionaryDefinitionInternal) {
    const path = def.path;
    const loaderType = determineType(path, def);
    const optValues = importantOptionKeys.map((k) => def[k]?.toString() || '');
    const parts = [path, loaderType].concat(optValues);

    return parts.join('|');
}

type StatsOrError = Stats | Error;

function isError(e: StatsOrError): e is Error {
    const err = e as Partial<Error>;
    return !!err.message;
}

function determineType(uri: string, opts: Pick<LoadOptions, 'type'>): LoaderType {
    const t: DictionaryFileTypes = (opts.type && opts.type in loaders && opts.type) || 'S';
    const defLoaderType: LoaderType = t;
    const defType = uri.endsWith('.trie.gz') ? 'T' : defLoaderType;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : defType;
}

function load(reader: Reader, uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(reader, uri, options);
}

function loadSync(reader: ReaderSync, uri: string, options: LoadOptions): SpellingDictionary {
    const type = determineType(uri, options);
    const loader = loadersSync[type] || loaders.default;
    return loader(reader, uri, options);
}

async function legacyWordList(readLines: Reader, filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return _legacyWordListSync(lines, filename, options);
}

function legacyWordListSync(readLinesSync: ReaderSync, filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return _legacyWordListSync(lines, filename, options);
}

function _legacyWordListSync(lines: Iterable<string>, filename: string, options: LoadOptions) {
    const words = pipe(
        lines,
        // Remove comments
        opMap((line) => line.replace(/#.*/g, '')),
        // Split on everything else
        opConcatMap((line) => line.split(/[^\w\p{L}\p{M}'’]+/gu)),
        opFilter((word) => !!word)
    );
    return createSpellingDictionary(words, options.name, filename, options);
}

async function wordsPerLineWordList(readLines: Reader, filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return _wordsPerLineWordList(lines, filename, options);
}

function wordsPerLineWordListSync(readLinesSync: ReaderSync, filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return _wordsPerLineWordList(lines, filename, options);
}

function _wordsPerLineWordList(lines: Iterable<string>, filename: string, options: LoadOptions) {
    const words = pipe(
        lines,
        // Remove comments
        opMap((line) => line.replace(/#.*/g, '')),
        // Split on everything else
        opConcatMap((line) => line.split(/\s+/gu)),
        opFilter((word) => !!word)
    );
    return createSpellingDictionary(words, options.name, filename, options);
}

async function loadSimpleWordList(reader: Reader, filename: string, options: LoadOptions) {
    const lines = await reader(filename);
    return createSpellingDictionary(lines, options.name, filename, options);
}

function loadSimpleWordListSync(readLinesSync: ReaderSync, filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return createSpellingDictionary(lines, options.name, filename, options);
}

async function loadTrie(readLines: Reader, filename: string, options: LoadOptions) {
    const lines = await readLines(filename);
    return createSpellingDictionaryFromTrieFile(lines, options.name, filename, options);
}

function loadTrieSync(readLinesSync: ReaderSync, filename: string, options: LoadOptions) {
    const lines = readLinesSync(filename);
    return createSpellingDictionaryFromTrieFile(lines, options.name, filename, options);
}
