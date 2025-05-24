import type { LintFileResult } from '../LintFileResult.js';

export interface CSpellLintResultCache {
    /**
     * Retrieve cached lint results for a given file name, if present in the cache.
     */
    getCachedLintResults(filename: string): Promise<LintFileResult | undefined>;
    /**
     * Set the cached lint results.
     */
    setCachedLintResults(result: LintFileResult, dependsUponFiles: string[]): void;
    /**
     * Persists the in-memory cache to disk.
     */
    reconcile(): void;
    /**
     * Resets the cache.
     */
    reset(): void;
}
