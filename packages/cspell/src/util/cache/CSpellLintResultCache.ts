import { ConfigInfo, FileResult } from '../../fileHelper';

export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file name, if present in the cache.
     */
    getCachedLintResults(filename: string, configInfo: ConfigInfo): Promise<FileResult | undefined>;
    /**
     * Set the cached lint results.
     */
    setCachedLintResults(result: FileResult, configInfo: ConfigInfo): void;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): void;
}
