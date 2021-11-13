import type { CSpellLintResultCache } from './CSpellLintResultCache';

/**
 * Dummy cache implementation that should be usd if caching option is disabled.
 */
export class DummyCache implements CSpellLintResultCache {
    getCachedLintResults(): Promise<undefined> {
        return Promise.resolve(undefined);
    }
    setCachedLintResults(): void {
        return;
    }
    reconcile(): void {
        return;
    }
}
