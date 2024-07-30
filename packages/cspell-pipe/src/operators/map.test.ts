import { describe, expect, test } from 'vitest';

import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { _opMapSync, opMap } from './map.js';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);

        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, mapToLen, opMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opMap(mapFn2));
        const sGen = pipeSync(values, mapToLen, _opMapSync(mapFn2));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
        expect(toArray(sGen)).toEqual(expected);
    });
});
