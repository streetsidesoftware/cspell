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

    /**
     * How a file's change is detected:
     * - `content`: a hash of the file's content.
     * - `metadata`: the file's size and modification time.
     */
    cacheStrategy: 'content' | 'metadata';

    /**
     * How file paths are stored:
     * - `universal`: relative to the cache file, so the cache can be shared.
     * - `legacy`: absolute.
     */
    cacheFormat: 'universal' | 'legacy';

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
 * Creates the cache: on disk when `useCache` is set, otherwise one that stores nothing.
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
