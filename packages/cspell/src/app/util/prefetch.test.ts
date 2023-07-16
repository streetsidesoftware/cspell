import { toAsyncIterable } from '@cspell/cspell-pipe';
import { opMap, opTake, pipe } from '@cspell/cspell-pipe/sync';
import { promisify } from 'util';
import { describe, expect, test } from 'vitest';

import { prefetchIterable } from './prefetch.js';

const wait = promisify(setTimeout);

describe('prefetch', () => {
    test('prefetch infinite src', () => {
        let calls = 0;

        function* src() {
            while (true) {
                yield ++calls;
            }
        }

        const iterable = prefetchIterable(src(), 5);
        const iter = iterable[Symbol.iterator]();

        expect(takeFrom(iter, 2)).toEqual([1, 2]);
        expect(calls).toBe(5);
        expect(takeFrom(iter, 2)).toEqual([3, 4]);
        expect(calls).toBe(7);
        expect(takeFrom(iter, 2)).toEqual([5, 6]);
        expect(calls).toBe(9);
    });

    test('prefetch array src', () => {
        let calls = 0;
        function fn() {
            return ++calls;
        }
        const src = [fn, fn, fn, fn, fn, fn, fn, fn, fn, fn];

        const iterable = prefetchIterable(
            pipe(
                src,
                opMap((fn) => fn()),
            ),
            5,
        );

        const values: number[] = [];

        for (const v of iterable) {
            values.push(v);
            if (values.length === 5) break;
        }
        expect(values).toEqual([1, 2, 3, 4, 5]);
        expect(calls).toBe(8);
    });

    test('prefetch limited 3', () => {
        let calls = 0;

        function* src() {
            while (true) {
                yield ++calls;
            }
        }

        const iterable = prefetchIterable(pipe(src(), opTake(3)), 5);
        const iter = iterable[Symbol.iterator]();

        expect(takeFrom(iter, 2)).toEqual([1, 2]);
        expect(calls).toBe(3);
        expect(takeFrom(iter, 2)).toEqual([3]);
        expect(calls).toBe(3);
        expect(takeFrom(iter, 2)).toEqual([]);
        expect(calls).toBe(3);
    });

    test('prefetch limited 7', () => {
        let calls = 0;

        function* src() {
            while (true) {
                yield ++calls;
            }
        }

        const iterable = prefetchIterable(pipe(src(), opTake(7)), 5);
        const iter = iterable[Symbol.iterator]();

        expect(takeFrom(iter, 2)).toEqual([1, 2]);
        expect(calls).toBe(5);
        expect(takeFrom(iter, 4)).toEqual([3, 4, 5, 6]);
        expect(calls).toBe(7);
        expect(takeFrom(iter, 2)).toEqual([7]);
        expect(calls).toBe(7);
    });

    test('promise', async () => {
        let calls = 0;

        function* src() {
            while (true) {
                const n = ++calls;
                yield wait(5).then(() => n);
            }
        }

        const values: number[] = [];
        for (const p of prefetchIterable(src(), 5)) {
            values.push(await p);
            if (values.length >= 6) break;
        }

        expect(values).toEqual([1, 2, 3, 4, 5, 6]);
        expect(calls).toBe(9);
    });

    test('for await', async () => {
        let calls = 0;

        function* src() {
            while (true) {
                const n = ++calls;
                yield wait(5).then(() => n);
            }
        }

        const values: number[] = [];
        for await (const p of prefetchIterable(src(), 5)) {
            values.push(p);
            if (values.length >= 6) break;
        }

        expect(values).toEqual([1, 2, 3, 4, 5, 6]);
        expect(calls).toBe(9);
    });

    test('for await async', async () => {
        let calls = 0;

        function* src() {
            while (true) {
                const n = ++calls;
                yield wait(5).then(() => n);
            }
        }

        const values: number[] = [];
        for await (const p of toAsyncIterable(prefetchIterable(src(), 5))) {
            values.push(p);
            await wait(3);
            if (values.length >= 6) break;
        }

        expect(values).toEqual([1, 2, 3, 4, 5, 6]);
        expect(calls).toBe(9);
    });
});

function takeFrom<T>(iter: Iterator<T>, num: number): T[] {
    const values: T[] = [];
    if (num < 1) return values;

    for (let next = iter.next(); !next.done; next = iter.next()) {
        values.push(next.value);
        if (values.length >= num) break;
    }
    return values;
}
