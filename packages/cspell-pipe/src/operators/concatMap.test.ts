/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test } from 'vitest';
import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opConcatMap } from './concatMap.js';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => [...v, '|'];
        const mapFn2 = (v: string) => [v, v.toUpperCase()];

        const expected = [...'one|two|three|'].flatMap(mapFn2);

        const mapToLen = opConcatMap(mapFn);

        const s = pipeSync(values, mapToLen, opConcatMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opConcatMap(mapFn2));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
