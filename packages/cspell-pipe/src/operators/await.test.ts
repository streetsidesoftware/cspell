/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test } from 'vitest';
import { opMap } from './map.js';
import { toArray } from '../helpers/index.js';
import { pipeAsync } from '../pipe.js';
import { opAwaitAsync } from './await.js';

describe('Validate await', () => {
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
});

function toPromise<T>(t: T): Promise<T> {
    return Promise.resolve(t);
}
