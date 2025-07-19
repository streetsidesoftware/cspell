import { describe, expect, test } from 'vitest';

import { DummyCache } from './DummyCache.js';

describe('DummyCache', () => {
    test('should implement CSpellLintResultCache interface', () => {
        const cache = new DummyCache();
        expect(cache).toHaveProperty('getCachedLintResults');
        expect(cache).toHaveProperty('setCachedLintResults');
        expect(cache).toHaveProperty('reconcile');
        expect(cache).toHaveProperty('reset');
    });

    describe('getCachedLintResults', () => {
        test('should return undefined', async () => {
            const cache = new DummyCache();

            const result = await cache.getCachedLintResults();

            expect(result).toBeUndefined();
        });
    });

    describe('setCachedLintResults', () => {
        test('should resolve without errors', async () => {
            const cache = new DummyCache();

            await expect(cache.setCachedLintResults()).resolves.toBeUndefined();
        });
    });

    describe('reconcile', () => {
        test('should resolve without errors', async () => {
            const cache = new DummyCache();

            await expect(cache.reconcile()).resolves.toBeUndefined();
        });
    });

    describe('reset', () => {
        test('should resolve without errors', async () => {
            const cache = new DummyCache();

            await expect(cache.reset()).resolves.toBeUndefined();
        });
    });
});
