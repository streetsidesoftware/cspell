import { describe, expect, test } from 'vitest';

import { Resolver } from './Resolver.js';

describe('Resolver', () => {
    test('Resolver resolve', () => {
        const resolver = new Resolver<number>();
        const promise = resolver.promise;
        expect(promise).toBeInstanceOf(Promise);
        resolver.resolve(42);
        return expect(promise).resolves.toBe(42);
    });

    test('Resolver reject', () => {
        const resolver = new Resolver<number>();
        const promise = resolver.promise;
        expect(promise).toBeInstanceOf(Promise);
        resolver.reject(new Error('Test error'));
        return expect(promise).rejects.toThrow('Test error');
    });

    test('Resolver isResolved', async () => {
        const resolver = new Resolver<number>();
        expect(resolver.isResolved).toBe(false);
        resolver.resolve(42);
        expect(resolver.isResolved).toBe(true);
        return expect(resolver.promise).resolves.toBe(42);
    });

    test('Resolver resolve more than once', () => {
        const resolver = new Resolver<number>();
        const promise = resolver.promise;
        expect(promise).toBeInstanceOf(Promise);
        resolver.resolve(42);
        resolver.resolve(100);
        resolver.reject(new Error('Test error'));
        return expect(promise).resolves.toBe(42);
    });
});
