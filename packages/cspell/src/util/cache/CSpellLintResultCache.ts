import { FileResult } from '../../util/fileHelper';
export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file name, if present in the cache.
     */
    getCachedLintResults(filename: string): Promise<FileResult | undefined>;
    /**
     * Set the cached lint results.
     */
    setCachedLintResults(result: FileResult, dependsUponFiles: string[]): void;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): void;
    /**
     * Resets the cache.
     */
    reset(): void;
}
