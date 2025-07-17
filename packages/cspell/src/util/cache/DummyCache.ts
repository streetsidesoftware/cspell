import type { CSpellLintResultCache } from './CSpellLintResultCache.js';

/**
 * Dummy cache implementation that should be usd if caching option is disabled.
 */
export class DummyCache implements CSpellLintResultCache {
    getCachedLintResults(): Promise<undefined> {
        return Promise.resolve(undefined);
    }
    setCachedLintResults(): Promise<void> {
        return Promise.resolve();
    }
    reconcile(): Promise<void> {
        return Promise.resolve();
    }
    reset(): Promise<void> {
        return Promise.resolve();
    }
}
