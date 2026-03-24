import { describe, expect, it, test } from 'vitest';

import { WeakCache } from './WeakCache.mjs';

describe('WeakCache', () => {
    it('should set and get primitive keys', () => {
        const cache = new WeakCache<number>();
        cache.set('foo', 123);
        cache.set(42, 456);
        expect(cache.get('foo')).toBe(123);
        expect(cache.get(42)).toBe(456);
        expect(cache.get('bar')).toBeUndefined();
    });

    it('should set and get object keys', () => {
        const cache = new WeakCache<string>();
        const obj1 = {};
        const obj2: string[] = [];
        cache.set(obj1, 'a');
        cache.set(obj2, 'b');
        expect(cache.get(obj1)).toBe('a');
        expect(cache.get(obj2)).toBe('b');
        expect(cache.get({})).toBeUndefined();
    });

    it('should distinguish between primitive and object keys', () => {
        const cache = new WeakCache<string>();
        const obj = {};
        cache.set(obj, 'object');
        cache.set('[object Object]', 'string');
        expect(cache.get(obj)).toBe('object');
        expect(cache.get('[object Object]')).toBe('string');
    });

    it('should clear all entries', () => {
        const cache = new WeakCache<number>();
        const obj = {};
        cache.set('foo', 1);
        cache.set(obj, 2);
        cache.clear();
        expect(cache.get('foo')).toBeUndefined();
        expect(cache.get(obj)).toBeUndefined();
    });

    it('should report presence of keys with has()', () => {
        const cache = new WeakCache<number>();
        const obj = {};
        cache.set('foo', 1);
        cache.set(obj, 2);
        expect(cache.has('foo')).toBe(true);
        expect(cache.has(obj)).toBe(true);
        expect(cache.has('bar')).toBe(false);
        expect(cache.has({})).toBe(false);
    });

    it('should initialize with entries', () => {
        const obj = {};
        const entries: [unknown, string][] = [
            ['a', 'alpha'],
            [obj, 'object'],
        ];
        const cache = new WeakCache<string>(entries);
        expect(cache.get('a')).toBe('alpha');
        expect(cache.get(obj)).toBe('object');
    });

    it('should overwrite values for the same key', () => {
        const cache = new WeakCache<number>();
        cache.set('foo', 1);
        cache.set('foo', 2);
        expect(cache.get('foo')).toBe(2);

        const obj = {};
        cache.set(obj, 3);
        cache.set(obj, 4);
        expect(cache.get(obj)).toBe(4);
    });

    it('should not throw when getting or setting null or undefined', () => {
        const cache = new WeakCache<string>();
        cache.set(null, 'null');
        cache.set(undefined, 'undefined');
        expect(cache.get(null)).toBe('null');
        expect(cache.get(undefined)).toBe('undefined');
    });

    it('should not leak memory for object keys (WeakMap semantics)', () => {
        // This test is limited: we can't force GC, but we can check that no error occurs.
        const cache = new WeakCache<string>();
        (() => {
            const obj = {};
            cache.set(obj, 'temp');
            expect(cache.get(obj)).toBe('temp');
        })();
        // After this block, obj is out of scope and may be GC'd.
        // We can't assert GC, but at least no error should occur.
    });
});

describe('Assert WeakMap assumptions', () => {
    test('WeakMap should not throw when calling has() with primitive keys', () => {
        const weakMap = new WeakMap<object, string>();
        expect(() => weakMap.has('foo' as unknown as object)).not.toThrow();
        expect(weakMap.has('foo' as unknown as object)).toBe(false);
    });
});
