import { FileResult } from '../../FileResult';

export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file path, if present in the cache.
     */
    getCachedLintResults(filePath: string): Promise<FileResult | undefined>;
    /**
     * Set the cached lint results for a given file path.
     */
    setCachedLintResults(filePath: string, result: FileResult): void;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): void;
}
