import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { DictionaryFileTypes } from '@cspell/cspell-types';
import { StrongWeakMap } from '@cspell/strong-weak-map';
import type { SpellingDictionary } from 'cspell-dictionary';
import {
    createFailedToLoadDictionary,
    createInlineSpellingDictionary,
    createSpellingDictionary,
    createSpellingDictionaryFromTrieFile,
} from 'cspell-dictionary';
import type { Stats, VFileSystem } from 'cspell-io';
import { compareStats, toFileURL, urlBasename } from 'cspell-io';

import type {
    DictionaryDefinitionInlineInternal,
    DictionaryDefinitionInternal,
    DictionaryFileDefinitionInternal,
} from '../../Models/CSpellSettingsInternalDef.js';
import { isDictionaryDefinitionInlineInternal } from '../../Models/CSpellSettingsInternalDef.js';
import { AutoResolveWeakCache } from '../../util/AutoResolve.js';
import { toError } from '../../util/errors.js';
import { SpellingDictionaryLoadError } from '../SpellingDictionaryError.js';

const MAX_AGE = 10000;

const loaders: Loaders = {
    S: loadSimpleWordList,
    C: legacyWordList,
    W: wordsPerLineWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};

export type LoadOptions = DictionaryDefinitionInternal;

type LoadFileOptions = DictionaryFileDefinitionInternal;

enum LoadingState {
    Loaded = 0,
    Loading = 1,
}

interface CacheEntry {
    uri: string;
    options: LoadFileOptions;
    ts: number;
    stat: Stats | Error | undefined;
    dictionary: SpellingDictionary | undefined;
    pending: Promise<readonly [SpellingDictionary, Stats | Error]>;
    loadingState: LoadingState;
    sig: number;
}

interface Reader {
    read(filename: URL): Promise<string>;
    readLines(filename: URL): Promise<string[]>;
}

type LoaderType = keyof Loaders;
type Loader = (reader: Reader, filename: URL, options: LoadOptions) => Promise<SpellingDictionary>;

interface Loaders {
    S: Loader;
    C: Loader;
    T: Loader;
    W: Loader;
    default: Loader;
}

export class DictionaryLoader {
    private dictionaryCache = new StrongWeakMap<string, CacheEntry>();
    private inlineDictionaryCache = new AutoResolveWeakCache<DictionaryDefinitionInlineInternal, SpellingDictionary>();
    private dictionaryCacheByDef = new StrongWeakMap<
        DictionaryDefinitionInternal,
        { key: string; entry: CacheEntry }
    >();
    private reader: Reader;

    constructor(private fs: VFileSystem) {
        this.reader = toReader(fs);
    }

    public loadDictionary(def: DictionaryDefinitionInternal): Promise<SpellingDictionary> {
        if (isDictionaryDefinitionInlineInternal(def)) {
            return Promise.resolve(this.loadInlineDict(def));
        }
        const { key, entry } = this.getCacheEntry(def);
        if (entry) {
            return entry.pending.then(([dictionary]) => dictionary);
        }
        const loadedEntry = this.loadEntry(def.path, def);
        this.setCacheEntry(key, loadedEntry, def);
        return loadedEntry.pending.then(([dictionary]) => dictionary);
    }

    /**
     * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
     * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
     * @param now - optional timestamp representing now. (Mostly used in testing)
     */
    public async refreshCacheEntries(maxAge = MAX_AGE, now = Date.now()): Promise<void> {
        await Promise.all([...this.dictionaryCache.values()].map((entry) => this.refreshEntry(entry, maxAge, now)));
    }

    private getCacheEntry(def: DictionaryFileDefinitionInternal): { key: string; entry: CacheEntry | undefined } {
        const defEntry = this.dictionaryCacheByDef.get(def);
        if (defEntry) {
            return defEntry;
        }
        const key = this.calcKey(def);
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
                const key = this.calcKey(entry.options);
                const newEntry = this.loadEntry(entry.uri, entry.options);
                this.dictionaryCache.set(key, newEntry);
                this.dictionaryCacheByDef.set(entry.options, { key, entry: newEntry });
            }
        }
    }

    private loadEntry(fileOrUri: string | URL, options: LoadFileOptions, now = Date.now()): CacheEntry {
        const url = toFileURL(fileOrUri);
        options = this.normalizeOptions(url, options);
        const pDictionary = load(this.reader, toFileURL(fileOrUri), options).catch((e) =>
            createFailedToLoadDictionary(
                options.name,
                fileOrUri,
                new SpellingDictionaryLoadError(url.href, options, e, 'failed to load'),
                options,
            ),
        );
        const pStat = this.getStat(fileOrUri);
        const pending = Promise.all([pDictionary, pStat]);
        const sig = now + Math.random();
        const entry: CacheEntry = {
            uri: url.href,
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

    private getStat(uri: URL | string): Promise<StatsOrError> {
        return this.fs.stat(toFileURL(uri)).catch(toError);
    }

    private isEqual(a: StatsOrError, b: StatsOrError | undefined): boolean {
        if (!b) return false;
        if (isError(a)) {
            return isError(b) && a.message === b.message && a.name === b.name;
        }
        return !isError(b) && !compareStats(a, b);
    }

    private normalizeOptions(uri: URL, options: LoadFileOptions): LoadFileOptions {
        if (options.name) return options;
        return { ...options, name: urlBasename(uri) };
    }

    private loadInlineDict(def: DictionaryDefinitionInlineInternal): SpellingDictionary {
        return this.inlineDictionaryCache.get(def, (def) =>
            createInlineSpellingDictionary(def, def.__source || 'memory'),
        );
    }

    private calcKey(def: DictionaryFileDefinitionInternal) {
        const path = def.path;
        const loaderType = determineType(toFileURL(path), def);
        const optValues = importantOptionKeys.map((k) => def[k]?.toString() || '');
        const parts = [path, loaderType].concat(optValues);

        return parts.join('|');
    }
}

function toReader(fs: VFileSystem): Reader {
    async function readFile(url: URL): Promise<string> {
        return (await fs.readFile(url)).getText();
    }

    return {
        read: readFile,
        readLines: async (filename) => toLines(await readFile(filename)),
    };
}

const importantOptionKeys: (keyof DictionaryDefinitionInternal)[] = ['name', 'noSuggest', 'useCompounds', 'type'];

type StatsOrError = Stats | Error;

function isError(e: StatsOrError): e is Error {
    const err = e as Partial<Error>;
    return !!err.message;
}

function determineType(uri: URL, opts: Pick<LoadOptions, 'type'>): LoaderType {
    const t: DictionaryFileTypes = (opts.type && opts.type in loaders && opts.type) || 'S';
    const defLoaderType: LoaderType = t;
    const defType = uri.pathname.endsWith('.trie.gz') ? 'T' : defLoaderType;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri.pathname) ? 'T' : defType;
}

function load(reader: Reader, uri: URL, options: LoadOptions): Promise<SpellingDictionary> {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(reader, uri, options);
}

async function legacyWordList(reader: Reader, filename: URL, options: LoadOptions) {
    const lines = await reader.readLines(filename);
    return _legacyWordListSync(lines, filename, options);
}

function _legacyWordListSync(lines: Iterable<string>, filename: URL, options: LoadOptions) {
    const words = pipe(
        lines,
        // Remove comments
        opMap((line) => line.replace(/#.*/g, '')),
        // Split on everything else
        opConcatMap((line) => line.split(/[^\w\p{L}\p{M}'’]+/gu)),
        opFilter((word) => !!word),
    );
    return createSpellingDictionary(words, options.name, filename.toString(), options);
}

async function wordsPerLineWordList(reader: Reader, filename: URL, options: LoadOptions) {
    const lines = await reader.readLines(filename);
    return _wordsPerLineWordList(lines, filename.toString(), options);
}

function _wordsPerLineWordList(lines: Iterable<string>, filename: string, options: LoadOptions) {
    const words = pipe(
        lines,
        // Remove comments
        opMap((line) => line.replace(/#.*/g, '')),
        // Split on everything else
        opConcatMap((line) => line.split(/\s+/gu)),
        opFilter((word) => !!word),
    );
    return createSpellingDictionary(words, options.name, filename, options);
}

async function loadSimpleWordList(reader: Reader, filename: URL, options: LoadOptions) {
    const lines = await reader.readLines(filename);
    return createSpellingDictionary(lines, options.name, filename.href, options);
}

async function loadTrie(reader: Reader, filename: URL, options: LoadOptions) {
    const content = await reader.read(filename);
    return createSpellingDictionaryFromTrieFile(content, options.name, filename.href, options);
}

function toLines(content: string): string[] {
    return content.split(/\n|\r\n|\r/);
}
