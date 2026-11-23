import type { CacheFormat, CacheStrategy } from '@cspell/cspell-types';
import { toFileURL } from '@cspell/url';

import type { CSpellLintResultCache } from './CSpellLintResultCache.js';
import { createDiskCache } from './DiskCache.js';
import { DummyCache } from './DummyCache.js';

export interface CreateCacheSettings {
    /**
     * Use a cache on disk. Otherwise the cache stores nothing.
     */
    useCache: boolean;

    /**
     * The absolute path of the cache file.
     */
    cacheLocation: string;

    cacheStrategy: CacheStrategy;

    cacheFormat: CacheFormat;

    /**
     * An entry is only reused when its version matches exactly.
     */
    version: string;

    /**
     * When true, causes the cache to be reset, removing any entries
     * or cache files.
     */
    reset?: true;

    /**
     * A value from the caller, stored with each entry. An entry is only reused when its tag matches exactly.
     * `undefined` when the caller has none.
     */
    contextTag?: string | undefined;
}

/**
 * Creates CSpellLintResultCache (disk cache if caching is enabled in config or dummy otherwise)
 */
export async function createCache(options: CreateCacheSettings): Promise<CSpellLintResultCache> {
    const { useCache, cacheLocation, cacheStrategy, reset, version } = options;
    const location = toFileURL(cacheLocation);
    const useChecksum = cacheStrategy === 'content';
    const useUniversal = options.cacheFormat === 'universal';
    const cache = useCache
        ? await createDiskCache(location, useChecksum, version, useUniversal, options.contextTag)
        : new DummyCache();
    if (reset) {
        await cache.reset();
    }
    return cache;
}
