/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test } from 'vitest';

import { toArray, toAsyncIterable } from './helpers/index.js';
import { pipeAsync, pipeSync } from './index.js';
import { opAwaitAsync, opFilter, opMap } from './operators/index.js';

describe('Validate async', () => {
    test('mergeAsyncIterables', async () => {
        const a = [...'hello'];
        const b = [...'there'];
        expect(await toArray(toAsyncIterable(a, b))).toEqual([...a, ...b]);
    });

    test('toAsyncIterable', async () => {
        const values = ['one', 'two', 'three'];
        expect(await toArray(toAsyncIterable(values, wrapInPromise(values), toAsync(values)))).toEqual([
            ...values,
            ...values,
            ...values,
        ]);
    });

    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);

        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, mapToLen, opMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opMap(mapFn2));

        const sync = [...s];
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });

    test('asyncAwait', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);
        const mapToLen = opMap(mapFn);
        const a = pipeAsync(values, opMap(toPromise), opAwaitAsync(), mapToLen, opMap(mapFn2));
        const async = await toArray(a);

        expect(async).toEqual(expected);
    });

    test('filter', async () => {
        const values = ['one', 'two', 'three'];

        const filterFn = (v: string) => v.length === 3;

        const expected = values.filter(filterFn);

        const filterToLen = opFilter(filterFn);

        const s = pipeSync(values, filterToLen);
        const a = pipeAsync(toAsyncIterable(values), filterToLen);

        const sync = [...s];
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});

function toPromise<T>(t: T): Promise<T> {
    return Promise.resolve(t);
}

async function wrapInPromise<T>(t: T): Promise<T> {
    return t;
}

async function* toAsync<T>(t: T[]) {
    yield* t;
}
