import { describe, expect, test } from 'vitest';

import { toArray } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opBuffer } from './buffer.js';
import { opTake } from './take.js';

describe('Validate buffer', () => {
    const values = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
    const values2 = [
        ['one', 'two'],
        ['three', 'four'],
        ['five', 'six'],
        ['seven', 'eight'],
        ['nine', 'ten'],
        ['eleven'],
    ];
    const values3 = [
        ['one', 'two', 'three'],
        ['four', 'five', 'six'],
        ['seven', 'eight', 'nine'],
        ['ten', 'eleven'],
    ];

    test.each`
        values    | size | expected
        ${values} | ${1} | ${values.map((v) => [v])}
        ${values} | ${2} | ${values2}
        ${values} | ${3} | ${values3}
    `('buffer $size', async ({ values, size, expected }) => {
        const resultSync = toArray(pipeSync(values, opBuffer(size)));
        expect(resultSync).toEqual(expected);

        const resultAsync = await toArray(pipeAsync(values, opBuffer(size)));
        expect(resultAsync).toEqual(expected);
    });

    test('buffer async array of promises', async () => {
        const result = await toArray(pipeAsync(delay(mapP(values), 1), opBuffer(3)));
        expect(result).toEqual(values3);
    });

    test('buffer stop early', async () => {
        let i = 0;
        let finallyCalled = false;
        function* gen() {
            try {
                i = 0;
                for (const v of values) {
                    ++i;
                    yield v;
                }
            } finally {
                finallyCalled = true;
            }
        }

        const result = toArray(pipeSync(gen(), opBuffer(3), opTake(3)));
        expect(i).toBe(3 * 3);
        expect(finallyCalled).toBe(true);
        expect(result).toEqual(values3.slice(0, 3));

        finallyCalled = false;
        const resultAsync = await toArray(pipeAsync(gen(), opBuffer(3), opTake(2)));
        expect(i).toBe(3 * 2);
        expect(finallyCalled).toBe(true);
        expect(resultAsync).toEqual(values3.slice(0, 2));
    });
});

function mapP<T>(v: T[]): Promise<T>[] {
    return v.map((v) => Promise.resolve(v));
}

async function* delay<T>(values: T[], ms: number): AsyncIterable<T> {
    for (const v of values) {
        await new Promise((resolve) => setTimeout(resolve, ms));
        yield v;
    }
}
