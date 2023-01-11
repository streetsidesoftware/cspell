/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test } from 'vitest';

import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opMap } from './map.js';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);

        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, mapToLen, opMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opMap(mapFn2));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
