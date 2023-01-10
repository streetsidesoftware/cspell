/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test, vi } from 'vitest';
import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opMap } from './map.js';
import { opTap } from './tap.js';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const tapFn1 = vi.fn();
        const tapFn2 = vi.fn();

        const expected = values.map(mapFn);
        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, opTap(tapFn1), mapToLen, opTap(tapFn2));
        toArray(s);
        expect(tapFn1.mock.calls.map((c) => c[0])).toEqual(values);
        expect(tapFn2.mock.calls.map((c) => c[0])).toEqual(expected);

        tapFn1.mockClear();
        tapFn2.mockClear();

        const a = pipeAsync(values, opTap(tapFn1), mapToLen, opTap(tapFn2));
        await toArray(a);

        expect(tapFn1.mock.calls.map((c) => c[0])).toEqual(values);
        expect(tapFn2.mock.calls.map((c) => c[0])).toEqual(expected);
    });
});
