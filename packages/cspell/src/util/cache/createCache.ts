import path from 'path';
import { CacheOptions } from './CacheOptions';
import { CSpellLintResultCache } from './CSpellLintResultCache';
import { DiskCache } from './DiskCache';
import { DummyCache } from './DummyCache';

// cspell:word cspellcache
export const DEFAULT_CACHE_LOCATION = '.cspellcache';

export interface CreateCacheOptions extends CacheOptions {
    root: string;
}

/**
 * Creates CSpellLintResultCache (disk cache if caching is enabled in config or dummy otherwise)
 */

export function createCache(options: CreateCacheOptions): CSpellLintResultCache {
    const { cache, cacheLocation = DEFAULT_CACHE_LOCATION, cacheStrategy = 'metadata', root } = options;
    return cache ? new DiskCache(path.resolve(root, cacheLocation), cacheStrategy === 'content') : new DummyCache();
}
