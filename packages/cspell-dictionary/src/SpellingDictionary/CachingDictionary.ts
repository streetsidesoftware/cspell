import type { CacheStats } from '../util/AutoCache';
import { autoCache, extractStats } from '../util/AutoCache';
import type { SearchOptions, SpellingDictionary } from './SpellingDictionary';
import type { SpellingDictionaryCollection } from './SpellingDictionaryCollection';
import { canonicalSearchOptions } from './SpellingDictionaryMethods';

interface CallStats {
    name: string;
    id: number;
    has: CacheStats;
    isNoSuggestWord: CacheStats;
    isForbidden: CacheStats;
}

let dictionaryCounter = 0;

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

    const cached = new CachedDict(dict, options);

    knownOptions.set(dict, cached);
    return cached;
}
