import type { CacheFormat, CacheStrategy } from '@cspell/cspell-types';

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

    /**
     * Resets the cache
     */
    cacheReset?: boolean;

    /**
     * Format of the cache file.
     * - `legacy` - use absolute paths in the cache file
     * - `universal` - use a sharable format.
     * @default 'legacy'
     */
    cacheFormat?: CacheFormat;
}

/**
 * The command-line options that change a file's result. A cached result is only reused when they match.
 */
export interface CacheKeyOptions {
    languageId?: string;
    locale?: string;
    report?: string | undefined;
    showSuggestions?: boolean;
    validateDirectives?: boolean;
}
