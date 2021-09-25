import type { CSpellLintResultCache } from '.';

/**
 * Dummy cache implementation that should be usd if caching option is disabled.
 */
export class DummyCache implements CSpellLintResultCache {
    getCachedLintResults() {
        return Promise.resolve(undefined);
    }
    setCachedLintResults(): void {
        return;
    }
    reconcile(): void {
        return;
    }
}
