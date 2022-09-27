import { CacheStats, autoCache, extractStats } from '../util/AutoCache';
import { SearchOptions, SpellingDictionary } from './SpellingDictionary';
import { isSpellingDictionaryCollection, SpellingDictionaryCollection } from './SpellingDictionaryCollection';
import { canonicalSearchOptions } from './SpellingDictionaryMethods';

interface CallStats {
    name: string;
    id: number;
    has: CacheStats;
    isNoSuggestWord: CacheStats;
    isForbidden: CacheStats;
}

let dictionaryCounter = 0;

const useCollections = false;

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
}

class CachedDict implements CachingDictionary {
    readonly name: string;
    readonly id = ++dictionaryCounter;
    constructor(private dict: SpellingDictionary, private options: SearchOptions) {
        this.name = dict.name;
        // console.log(`CachedDict for ${this.name}`);
    }

    readonly has = autoCache((word: string) => this.dict.has(word, this.options));
    readonly isNoSuggestWord = autoCache((word: string) => this.dict.isNoSuggestWord(word, this.options));
    readonly isForbidden = autoCache((word: string) => this.dict.isForbidden(word));

    stats(): CallStats {
        return {
            name: this.name,
            id: this.id,
            has: extractStats(this.has),
            isNoSuggestWord: extractStats(this.isNoSuggestWord),
            isForbidden: extractStats(this.isForbidden),
        };
    }
}

class CachedDictCollection implements CachingDictionary {
    readonly id = ++dictionaryCounter;
    constructor(readonly name: string, private dicts: CachingDictionary[]) {
        // console.log(`CachedDictCollection for ${this.name}`);
    }

    readonly has = autoCache((word: string) => this.hasIn(word));
    readonly isNoSuggestWord = autoCache((word: string) => this.isNoSuggestWordAny(word));
    readonly isForbidden = autoCache((word: string) => this.isForbiddenAny(word));

    stats(): CallStats & { dicts: CallStats[] } {
        return {
            name: this.name,
            id: this.id,
            has: extractStats(this.has),
            isNoSuggestWord: extractStats(this.isNoSuggestWord),
            isForbidden: extractStats(this.isForbidden),
            dicts: this.dicts.map((d) => d.stats()),
        };
    }

    private hasIn(word: string) {
        const dicts = this.dicts;
        const len = this.dicts.length;
        for (let i = 0; i < len; ++i) {
            if (dicts[i].has(word)) return true;
        }
        return false;
    }

    private isNoSuggestWordAny(word: string) {
        const dicts = this.dicts;
        const len = this.dicts.length;
        for (let i = 0; i < len; ++i) {
            if (dicts[i].isNoSuggestWord(word)) return true;
        }
        return false;
    }

    private isForbiddenAny(word: string) {
        const dicts = this.dicts;
        const len = this.dicts.length;
        for (let i = 0; i < len; ++i) {
            if (dicts[i].isForbidden(word)) return true;
        }
        return false;
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
    options: SearchOptions
): CachingDictionary {
    options = canonicalSearchOptions(options);
    let knownOptions = knownDicts.get(options);
    if (!knownOptions) {
        knownOptions = new WeakMap();
        knownDicts.set(options, knownOptions);
    }
    const known = knownOptions.get(dict);
    if (known) return known;

    const cached =
        isSpellingDictionaryCollection(dict) && useCollections
            ? createCachingDictionaryCollection(dict, options)
            : new CachedDict(dict, options);

    knownOptions.set(dict, cached);
    return cached;
}

function createCachingDictionaryCollection(
    dict: SpellingDictionaryCollection,
    options: SearchOptions
): CachingDictionary {
    const dicts = dict.dictionaries.map((dict) => createCachingDictionary(dict, options));
    return new CachedDictCollection(dict.name, dicts);
}
