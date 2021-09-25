import path from 'path';
import type { CSpellApplicationConfiguration } from '../../CSpellApplicationConfiguration';
import type { ConfigInfo, FileResult } from '../../fileHelper';
import { DummyCache } from './DummyCache';
import { DiskCache } from './DiskCache';

// cspell:word cspellcache
export const DEFAULT_CACHE_LOCATION = '.cspellcache';

export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file name, if present in the cache.
     */
    getCachedLintResults(filename: string): Promise<FileResult | undefined>;
    /**
     * Set the cached lint results.
     */
    setCachedLintResults(result: FileResult): void;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): void;
}

/**
 * Creates CSpellLintResultCache (disk cache if caching is enabled in config or dummy otherwise)
 */
export function createCache(cfg: CSpellApplicationConfiguration, configInfo: ConfigInfo): CSpellLintResultCache {
    const { cache, cacheLocation = DEFAULT_CACHE_LOCATION, cacheStrategy = 'metadata' } = cfg.options;
    return cache
        ? new DiskCache(path.resolve(cfg.root, cacheLocation), configInfo, cacheStrategy === 'content')
        : new DummyCache();
}
