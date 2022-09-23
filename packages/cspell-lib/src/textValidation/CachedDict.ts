import { SpellingDictionary } from 'cspell-dictionary';

export interface DictionaryHasOptions {
    ignoreCase: boolean;
    useCompounds: boolean | undefined;
}

export interface CachedDict {
    has(word: string): boolean;
    isNoSuggestWord(word: string): boolean;
    isForbidden(word: string): boolean;
}

class CachedDictImpl implements CachedDict {
    constructor(private dict: SpellingDictionary, private options: DictionaryHasOptions) {}

    readonly has = autoCache((word: string) => this.dict.has(word, this.options));
    readonly isNoSuggestWord = autoCache((word: string) => this.dict.isNoSuggestWord(word, this.options));
    readonly isForbidden = autoCache((word: string) => this.dict.isForbidden(word));
}

const knownDicts = new WeakMap<SpellingDictionary, number>();

export function createDictCache(dict: SpellingDictionary, options: DictionaryHasOptions): CachedDict {
    const count = knownDicts.get(dict) || 0;
    if (count) {
        console.log('Cache hit: ' + count);
    }
    knownDicts.set(dict, count + 1);
    return new CachedDictImpl(dict, options);
}

function autoCache<P extends string, R>(fn: (p: P) => R): (p: P) => R {
    const cache: Record<P, R> = Object.create(null);

    function get(p: P): R {
        if (p in cache) return cache[p];
        const r = fn(p);
        cache[p] = r;
        return r;
    }

    return get;
}
