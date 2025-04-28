import fs from 'node:fs/promises';

import * as flatted from 'flatted';
import { describe, expect, test } from 'vitest';

import { parse, stringify } from './index.js';
import { dataHeader, Unpacked } from './types.mjs';

describe('Flatpack vs Flatted', async () => {
    const pkgJson = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));
    const fileList = (await fs.readFile(new URL('../fixtures/fileList.txt', import.meta.url), 'utf8')).split('\n');
    const cspellCache = flatted.parse(
        await fs.readFile(new URL('../fixtures/cspell-cache-flatted.json', import.meta.url), 'utf8'),
    );

    await fs.writeFile(
        new URL('../fixtures/cspell-cache-flatpack.json', import.meta.url),
        stringify(cspellCache, true, { optimize: true }),
    );

    const e = { two: '2' };
    const f = { ...e };
    const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const numbersObj = Object.fromEntries(numbers.map((n) => [n, n]));
    const a: [Record<string, Unpacked>, ...Unpacked[]] = [
        { one: 1 },
        e,
        e,
        f,
        { three: 'two' },
        numbers,
        numbersObj,
        [...numbers],
    ];
    a[0].a = a;

    test.each`
        obj            | expected
        ${a}           | ${'flatpack'}
        ${[e, e, e]}   | ${'flatted'}
        ${pkgJson}     | ${'flatted'}
        ${fileList}    | ${'flatpack'}
        ${cspellCache} | ${'flatpack'}
    `('compare flatted to flatpack-json', ({ obj, expected }) => {
        const flattedJson = flatted.stringify(obj);
        const flatpackJsonFile = stringify(obj, false);
        const flatpackJson = flatpackJsonFile.replace(dataHeader, '');
        const result = flatpackJson.length < flattedJson.length ? 'flatpack' : 'flatted';
        // console.log('%o', {
        //     expected,
        //     result,
        //     diff: flatpackJson.length - flattedJson.length,
        //     ratio: flatpackJson.length / flattedJson.length,
        // });
        try {
            expect(result).toBe(expected);
            expect(parse(flatpackJsonFile)).toEqual(obj);
        } catch (e) {
            console.log('%o', { flattedJson, flatpackJson });
            throw e;
        }
    });
});
