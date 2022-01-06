import { CacheSettings, CSpellSettings } from '@cspell/cspell-types';
import path from 'path';
import { CacheOptions } from '.';
import { CSpellLintResultCache } from './CSpellLintResultCache';
import { DiskCache } from './DiskCache';
import { DummyCache } from './DummyCache';
import { stat } from 'fs-extra';
import { isError } from '../errors';

// cspell:word cspellcache
export const DEFAULT_CACHE_LOCATION = '.cspellcache';

export type CreateCacheSettings = Required<CacheSettings>;

/**
 * Creates CSpellLintResultCache (disk cache if caching is enabled in config or dummy otherwise)
 */

export function createCache(options: CreateCacheSettings): CSpellLintResultCache {
    const { useCache, cacheLocation, cacheStrategy } = options;
    return useCache ? new DiskCache(path.resolve(cacheLocation), cacheStrategy === 'content') : new DummyCache();
}

export async function calcCacheSettings(
    config: CSpellSettings,
    cacheOptions: CacheOptions,
    root: string
): Promise<CreateCacheSettings> {
    const cs = config.cache ?? {};
    const useCache = cacheOptions.cache ?? cs.useCache ?? false;
    const cacheLocation = await resolveCacheLocation(
        path.resolve(root, cacheOptions.cacheLocation ?? cs.cacheLocation ?? DEFAULT_CACHE_LOCATION)
    );

    const cacheStrategy = cacheOptions.cacheStrategy ?? cs.cacheStrategy ?? 'metadata';
    return {
        useCache,
        cacheLocation,
        cacheStrategy,
    };
}

async function resolveCacheLocation(cacheLocation: string): Promise<string> {
    try {
        const s = await stat(cacheLocation);
        if (s.isFile()) return cacheLocation;
        return path.join(cacheLocation, DEFAULT_CACHE_LOCATION);
    } catch (err) {
        if (isError(err) && err.code === 'ENOENT') {
            return cacheLocation;
        }
        throw err;
    }
}
