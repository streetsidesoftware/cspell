import { describe, expect, test, vi } from 'vitest';

import { createAutoResolveCache, createAutoResolveWeakCache } from './AutoResolve';

describe('AutoResolve', () => {
    test('createAutoResolveCache', () => {
        const cache = createAutoResolveCache<string, string>();

        const resolver = vi.fn((s: string) => s.toUpperCase());

        expect(cache.get('hello')).toBe(undefined);
        expect(cache.get('hello', resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get('hello', resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        cache.set('hello', 'hello');
        expect(cache.get('hello', resolver)).toBe('hello');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get('a', resolver)).toBe('A');
        expect(resolver).toHaveBeenCalledTimes(2);
    });

    test('createAutoResolveWeakCache', () => {
        const cache = createAutoResolveWeakCache<{ name: string }, string>();

        const resolver = vi.fn((v: { name: string }) => v.name.toUpperCase());

        const tagHello = { name: 'hello' };
        const tagHello2 = { ...tagHello };
        const tagA = { name: 'a' };
        expect(cache.get(tagHello)).toBe(undefined);
        expect(cache.get(tagHello, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get(tagHello, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        cache.set(tagHello, 'hello');
        expect(cache.get(tagHello, resolver)).toBe('hello');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get(tagA, resolver)).toBe('A');
        expect(resolver).toHaveBeenCalledTimes(2);
        expect(cache.get(tagHello2)).toBe(undefined);
        expect(cache.get(tagHello2, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(3);
    });
});
