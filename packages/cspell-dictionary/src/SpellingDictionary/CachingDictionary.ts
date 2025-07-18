import type { AutoCache, CacheStats } from '../util/AutoCache.js';
import { autoCache, extractStats } from '../util/AutoCache.js';
import type { PreferredSuggestion, SearchOptions, SpellingDictionary } from './SpellingDictionary.js';
import type { SpellingDictionaryCollection } from './SpellingDictionaryCollection.js';
import { canonicalSearchOptions } from './SpellingDictionaryMethods.js';
import type { SuggestOptionsRO } from './SuggestOptions.js';

interface CallStats {
    name: string;
    id: number;
    has: CacheStats;
    isNoSuggestWord: CacheStats;
    isForbidden: CacheStats;
    getPreferredSuggestions: CacheStats;
}

let dictionaryCounter = 0;

const DefaultAutoCacheSize = 1000;

let logRequests = false;
const log: LogEntry[] = [];

/**
 * Caching Dictionary remembers method calls to increase performance.
 */
export interface CachingDictionary {
    name: string;
    id: number;
    has(word: string): boolean;
    isNoSuggestWord(word: string): boolean;
    isForbidden(word: string): boolean;
    stats(): CallStats;
    getPreferredSuggestions(word: string): PreferredSuggestion[] | undefined;
    suggest(word: string, suggestOptions?: SuggestOptionsRO): import('cspell-trie-lib').SuggestionResult[];
}

interface LogEntryBase extends SearchOptions {
    time: number;
    method: 'has';
    word: string;
    value?: unknown;
}

interface LogEntryHas extends LogEntryBase {
    method: 'has';
    value: boolean;
}

const startTime = performance.now();

export type LogEntry = LogEntryHas;

class CachedDict implements CachingDictionary {
    readonly name: string;
    readonly id = ++dictionaryCounter;
    readonly has: (word: string) => boolean;
    readonly #has: AutoCache<boolean>;
    constructor(
        private dict: SpellingDictionary,
        private options: SearchOptions,
    ) {
        this.name = dict.name;
        const has = autoCache((word: string) => this.dict.has(word, this.options), DefaultAutoCacheSize);
        const hasAndLog = (word: string): boolean => {
            const time = performance.now() - startTime;
            const value = has(word);
            log.push({ time, method: 'has', word, value });
            return value;
        };
        this.#has = has;
        this.has = logRequests ? hasAndLog : has;
        // console.log(`CachedDict for ${this.name}`);
    }

    readonly isNoSuggestWord = autoCache(
        (word: string) => this.dict.isNoSuggestWord(word, this.options),
        DefaultAutoCacheSize,
    );
    readonly isForbidden = autoCache((word: string) => this.dict.isForbidden(word), DefaultAutoCacheSize);
    readonly getPreferredSuggestions = autoCache(
        (word: string) => this.dict.getPreferredSuggestions?.(word),
        DefaultAutoCacheSize,
    );
    readonly suggest = (word: string, suggestOptions?: SuggestOptionsRO) => this.dict.suggest(word, suggestOptions);

    stats(): CallStats {
        return {
            name: this.name,
            id: this.id,
            has: extractStats(this.#has),
            isNoSuggestWord: extractStats(this.isNoSuggestWord),
            isForbidden: extractStats(this.isForbidden),
            getPreferredSuggestions: extractStats(this.getPreferredSuggestions),
        };
    }
}

const knownDicts = new Map<SearchOptions, WeakMap<SpellingDictionary, CachingDictionary>>();

/**
 * create a caching dictionary
 * @param dict - Dictionary to cache the search results.
 * @param options - Search options to use.
 * @returns CachingDictionary
 */
export function createCachingDictionary(
    dict: SpellingDictionary | SpellingDictionaryCollection,
    options: SearchOptions,
): CachingDictionary {
    options = canonicalSearchOptions(options);
    let knownOptions = knownDicts.get(options);
    if (!knownOptions) {
        knownOptions = new WeakMap();
        knownDicts.set(options, knownOptions);
    }
    const known = knownOptions.get(dict);
    if (known) return known;

    const cached = new CachedDict(dict, options);

    knownOptions.set(dict, cached);
    return cached;
}

export function enableLogging(enabled: boolean = !logRequests): void {
    logRequests = enabled;
}

export function getLog(): LogEntryBase[] {
    return log;
}
