import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { dispatchClearCache } from '../events/events.js';
import { CalcLeftRightResultWeakCache } from './mergeCache.js';

describe('CalcLeftRightResultWeakCache', () => {
    let cache: CalcLeftRightResultWeakCache<object, object, number>;

    beforeEach(() => {
        cache = new CalcLeftRightResultWeakCache();
    });

    afterEach(() => {
        cache.dispose();
    });

    test('should return the cached result if available', () => {
        const left = {};
        const right = {};
        const expectedResult = 42;

        cache.get(left, right, () => expectedResult);

        const result = cache.get(left, right, () => {
            throw new Error('This callback should not be called');
        });

        expect(result).toBe(expectedResult);
    });

    test('should calculate and cache the result if not available', () => {
        const left = {};
        const right = {};
        const expectedResult = 42;

        const result = cache.get(left, right, () => expectedResult);

        expect(result).toBe(expectedResult);
    });

    test('should clear the cache', () => {
        const left = {};
        const right = {};
        const expectedResult = 42;

        const mockResolve = vi.fn(() => expectedResult);

        const result1 = cache.get(left, right, mockResolve);
        expect(result1).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(1);

        const result2 = cache.get(left, right, mockResolve);
        expect(result2).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(1);

        cache.clear();

        const result3 = cache.get(left, right, mockResolve);
        expect(result3).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(2);

        expect(result3).toBe(expectedResult);
    });

    test('should dispose the cache', () => {
        const left = {};
        const right = {};
        const expectedResult = 42;

        const mockResolve = vi.fn(() => expectedResult);

        const result1 = cache.get(left, right, mockResolve);
        expect(result1).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(1);

        const result2 = cache.get(left, right, mockResolve);
        expect(result2).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(1);

        expect(cache.stats()).toEqual({ clears: 0, deletes: 0, hits: 1, misses: 1, resolved: 1, sets: 0 });

        dispatchClearCache();

        expect(cache.stats()).toEqual({ clears: 1, deletes: 0, hits: 1, misses: 1, resolved: 1, sets: 0 });

        const result3 = cache.get(left, right, mockResolve);
        expect(result3).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(2);

        expect(cache.stats()).toEqual({ clears: 1, deletes: 0, hits: 1, misses: 2, resolved: 2, sets: 0 });

        cache.dispose();

        expect(cache.stats()).toEqual({ clears: 2, deletes: 0, hits: 1, misses: 2, resolved: 2, sets: 0 });

        const result4 = cache.get(left, right, mockResolve);
        expect(result4).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(3);

        expect(cache.stats()).toEqual({ clears: 2, deletes: 0, hits: 1, misses: 3, resolved: 3, sets: 0 });

        const result5 = cache.get(left, right, mockResolve);
        expect(result5).toBe(expectedResult);
        expect(mockResolve).toHaveBeenCalledTimes(3);

        expect(cache.stats()).toEqual({ clears: 2, deletes: 0, hits: 2, misses: 3, resolved: 3, sets: 0 });

        // dispatchClearCache will be ignored because the cache has been disposed
        dispatchClearCache();

        expect(cache.stats()).toEqual({ clears: 2, deletes: 0, hits: 2, misses: 3, resolved: 3, sets: 0 });
    });
});
