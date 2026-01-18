import { describe, expect, test } from 'vitest';

import { Future } from './Future.js';

describe('Future', () => {
    test('FuturePromise resolves', async () => {
        const f = new Future<number>();

        expect(f.isResolved).toBe(false);
        expect(f.isRejected).toBe(false);

        const p = f.promise;
        const q = f.promise;

        expect(p).toBe(q);

        f.resolve(42);

        expect(f.isResolved).toBe(true);
        expect(f.isRejected).toBe(false);

        const result = await p;
        expect(result).toBe(42);
    });

    test('FuturePromise rejects', async () => {
        const f = new Future<number>();

        expect(f.isResolved).toBe(false);
        expect(f.isRejected).toBe(false);

        const p = f.promise;

        f.reject(new Error('Test Error'));

        expect(f.isResolved).toBe(true);
        expect(f.isRejected).toBe(true);

        await expect(p).rejects.toThrow('Test Error');
    });

    test('FuturePromise double resolve.', async () => {
        const f = new Future<number>();
        const p = f.promise;
        f.resolve(42);
        expect(f.isResolved).toBe(true);
        expect(f.isRejected).toBe(false);
        await expect(f.promise).resolves.toBe(42);

        f.resolve(101);
        await expect(f.promise).resolves.toBe(42);

        f.reject(new Error('Test Error'));
        await expect(f.promise).resolves.toBe(42);

        expect(f.promise).toBe(p);
    });

    test('FuturePromise double reject.', async () => {
        const f = new Future<number>();
        const p = f.promise;
        const err = new Error('Test Error');
        f.reject(err);
        expect(f.isResolved).toBe(true);
        expect(f.isRejected).toBe(true);
        await expect(f.promise).rejects.toBe(err);

        f.resolve(101);
        await expect(f.promise).rejects.toBe(err);

        f.reject(new Error('Test Error 2'));
        await expect(f.promise).rejects.toBe(err);

        expect(f.promise).toBe(p);
    });
});

describe('Old Resolver behavior still holds true.', () => {
    const Resolver = Future;

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
