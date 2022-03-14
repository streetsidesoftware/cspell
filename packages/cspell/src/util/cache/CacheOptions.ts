import type { CacheStrategy } from '@cspell/cspell-types';

export interface CacheOptions {
    /**
     * The version of `cspell` that made the cache entry.
     * Cache entries must match the `major.minor` version.
     */
    version: string;
    /**
     * Store the info about processed files in order to only operate on the changed ones.
     */
    cache?: boolean;

    // cspell:word cspellcache
    /**
     * Path to the cache location. Can be a file or a directory.
     * If none specified .cspellcache will be used.
     * The file will be created in the directory where the cspell command is executed.
     */
    cacheLocation?: string;

    /**
     * Strategy to use for detecting changed files, default: metadata
     */
    cacheStrategy?: CacheStrategy;
}
