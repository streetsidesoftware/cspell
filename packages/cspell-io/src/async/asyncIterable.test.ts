import { describe, expect, test } from 'vitest';

import { toArray } from './asyncIterable.js';

describe('asyncIterable', () => {
    test('toArray', async () => {
        const r = toArray(emit([1, 2, 3, Promise.resolve(4), 5]));
        await expect(r).resolves.toEqual([1, 2, 3, 4, 5]);
    });
});

async function* emit<T>(values: Iterable<T | Promise<T>>): AsyncIterableIterator<T> {
    for await (const v of values) {
        yield v;
    }
}
