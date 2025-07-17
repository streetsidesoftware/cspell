import type { LintFileResult } from '../LintFileResult.js';

export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file name, if present in the cache.
     */
    getCachedLintResults(filename: string): Promise<LintFileResult | undefined>;
    /**
     * Set the cached lint results.
     */
    setCachedLintResults(result: LintFileResult, dependsUponFiles: string[]): Promise<void>;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): Promise<void>;
    /**
     * Resets the cache.
     */
    reset(): Promise<void>;
}
