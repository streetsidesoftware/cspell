import assert from 'node:assert';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import type { CSpellSettings } from '@cspell/cspell-types';

import type { CacheOptions } from '../../options.js';
import type { CreateCacheSettings } from '../../util/cache/index.js';
import { isErrorLike } from '../../util/errors.js';
import type { FingerprintOptions } from './cacheFingerprint.js';
import { calcCacheFingerprint } from './cacheFingerprint.js';

// cspell:word cspellcache
export const DEFAULT_CACHE_LOCATION = '.cspellcache';

const versionSuffix = '';

/**
 * The cache settings for a lint run.
 * @param config - The run's settings, merged with the command line.
 * @param options - The command-line options, plus the loaded config file and the search stops for the context tag.
 * @param root - Command-line paths are relative to it.
 * @param version - The cspell version.
 */
export async function calcCacheSettings(
    config: CSpellSettings,
    options: CacheOptions & FingerprintOptions,
    root: string,
    version: string,
): Promise<CreateCacheSettings> {
    const cs = config.cache ?? {};
    const useCache = options.cache ?? cs.useCache ?? false;
    const cacheLocation = await resolveCacheLocation(
        path.resolve(root, options.cacheLocation ?? cs.cacheLocation ?? DEFAULT_CACHE_LOCATION),
    );

    const cacheStrategy = options.cacheStrategy ?? cs.cacheStrategy ?? 'content';
    const cacheFormat = options.cacheFormat ?? cs.cacheFormat ?? 'universal';
    const optionals: Partial<CreateCacheSettings> = {};
    if (options.cacheReset) {
        optionals.reset = true;
    }
    // The merged settings, not the flags: a config file can also set these.
    const contextTag = calcCacheFingerprint(
        {
            ...options,
            configSearch: !config.noConfigSearch,
            defaultConfiguration: config.loadDefaultConfiguration ?? true,
        },
        root,
    );
    if (contextTag) {
        optionals.contextTag = contextTag;
    }
    return {
        ...optionals,
        useCache,
        cacheLocation,
        cacheStrategy,
        version: normalizeVersion(version),
        cacheFormat,
    };
}

async function resolveCacheLocation(cacheLocation: string): Promise<string> {
    try {
        const s = await stat(cacheLocation);
        if (s.isFile()) return cacheLocation;
        return path.join(cacheLocation, DEFAULT_CACHE_LOCATION);
    } catch (err) {
        if (isErrorLike(err) && err.code === 'ENOENT') {
            return cacheLocation;
        }
        throw err;
    }
}

/**
 * Normalizes the version and return only `major.minor + versionSuffix`
 * @param version The cspell semantic version.
 */
function normalizeVersion(version: string): string {
    const parts = version.split('.').slice(0, 2);
    assert(parts.length === 2);
    return parts.join('.') + versionSuffix;
}

export const __testing__: {
    normalizeVersion: typeof normalizeVersion;
    versionSuffix: string;
} = {
    normalizeVersion,
    versionSuffix,
};
