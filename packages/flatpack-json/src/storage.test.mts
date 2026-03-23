import fs from 'node:fs/promises';

import { findMatchingFileTypes } from '@cspell/filetypes';
import { createPatch } from 'diff';
import { describe, expect, test } from 'vitest';

import { generateUnpackMetaData } from './flatpacked.mjs';
import { normalizeOptions, stringify, toJSON } from './storage.mjs';
import { CompactStorageV2 } from './storageV2.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import type { FlatpackOptions, Serializable } from './types.mjs';
import { fromJSON } from './unpack.mjs';
import { extractUnpackedMetaData } from './unpackedAnnotation.mjs';

const urlFixtures = new URL('../fixtures/', import.meta.url);
const urlFileList = new URL('fileList.txt', urlFixtures);
const urlNpmV1 = new URL('.npm-packages-info-v1.json', urlFixtures);
const baseFilename = new URL(import.meta.url).pathname.split('/').slice(-1).join('').split('.').slice(0, -2).join('.');

describe('dehydrate', async () => {
    test.each`
        data
        ${undefined}
        ${'string'}
        ${1}
        ${1.1}
        ${null}
        ${true}
        ${false}
        ${[]}
        ${[1, 2]}
        ${['a', 'b', 'a', 'b']}
        ${{}}
        ${{ a: 1 }}
        ${{ a: { b: 1 } }}
        ${{ a: { a: 'a', b: 42 } }}
        ${{ a: [1] }}
    `('dehydrate/hydrate $data', ({ data }) => {
        const v = toJSON(data);
        expect(fromJSON(v)).toEqual(data);
    });

    const biMaxSafe = BigInt(Number.MAX_SAFE_INTEGER);

    test.each`
        data                                                                                            | options
        ${undefined}                                                                                    | ${undefined}
        ${'string'}                                                                                     | ${undefined}
        ${1}                                                                                            | ${undefined}
        ${1.1}                                                                                          | ${undefined}
        ${null}                                                                                         | ${undefined}
        ${true}                                                                                         | ${undefined}
        ${false}                                                                                        | ${undefined}
        ${[]}                                                                                           | ${undefined}
        ${[1, 2]}                                                                                       | ${undefined}
        ${['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple']}                                 | ${undefined}
        ${new Set(['apple', 'banana', 'pineapple'])}                                                    | ${undefined}
        ${new Set(['pineapple', 'apple', 'banana'])}                                                    | ${undefined}
        ${new Map([['apple', 1], ['banana', 2], ['pineapple', 3]])}                                     | ${undefined}
        ${{}}                                                                                           | ${undefined}
        ${[{}, {}, {}]}                                                                                 | ${undefined}
        ${{ a: 1 }}                                                                                     | ${undefined}
        ${{ a: { b: 1 } }}                                                                              | ${undefined}
        ${{ a: { a: 'a', b: 42 } }}                                                                     | ${undefined}
        ${{ a: [1] }}                                                                                   | ${undefined}
        ${{ values: ['apple', 'banana', 'pineapple'], set: new Set(['apple', 'banana', 'pineapple']) }} | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'c', b: 'd' }, { b: 'b', a: 'a' }, ['a', 'b'], ['c', 'd']]}         | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }]}             | ${{ dedupe: false }}
        ${sampleNestedData()}                                                                           | ${undefined}
        ${sampleRepeatedStrings()}                                                                      | ${undefined}
        ${/[\p{L}\p{M}]+/gu}                                                                            | ${undefined}
        ${[/[\p{L}\p{M}]+/gu, /[\p{L}\p{M}]+/gu, /[\p{Lu}\p{M}]+/gu]}                                   | ${undefined}
        ${[new Date('2024-01-01'), new Date('2024-01-01'), new Date('2024-01-02')]}                     | ${undefined}
        ${[1n, 2n, 1n, 2n, biMaxSafe, -biMaxSafe, biMaxSafe + 1n, -biMaxSafe - 1n]}                     | ${undefined}
        ${[Object(1n), Object('hello'), Object(/\w+/g), Object(null), Object([]), Object('hello')]}     | ${undefined}
    `('dehydrate V1 $data $options', ({ data, options }) => {
        const v = toJSON(data, { ...options });
        expect(stringifyFlatpacked(v)).toMatchSnapshot();
        expect(fromJSON(v)).toEqual(data);
        expect(fromJSON(JSON.parse(JSON.stringify(v)))).toEqual(data);
        expect(fromJSON(JSON.parse(stringify(data)))).toEqual(data);
        expect(fromJSON(JSON.parse(stringify(data, false)))).toEqual(data);
        const vv = toJSON(data, { ...options, optimize: true });
        expect(stringifyFlatpacked(vv)).toMatchSnapshot('optimized');
        expect(fromJSON(vv)).toEqual(data);
    });

    test.each`
        data                                                                                                | options
        ${undefined}                                                                                        | ${undefined}
        ${'string'}                                                                                         | ${undefined}
        ${1}                                                                                                | ${undefined}
        ${1.1}                                                                                              | ${undefined}
        ${null}                                                                                             | ${undefined}
        ${true}                                                                                             | ${undefined}
        ${false}                                                                                            | ${undefined}
        ${[]}                                                                                               | ${undefined}
        ${[1, 2]}                                                                                           | ${undefined}
        ${['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple']}                                     | ${undefined}
        ${['pineapple', 'apple', 'grape', 'banana', 'apple', 'banana', 'apple', 'pineapple']}               | ${undefined}
        ${new Set(['apple', 'banana', 'pineapple'])}                                                        | ${undefined}
        ${new Set(['pineapple', 'apple', 'banana'])}                                                        | ${undefined}
        ${new Map([['apple', 1], ['banana', 2], ['pineapple', 3]])}                                         | ${undefined}
        ${{}}                                                                                               | ${undefined}
        ${[{}, {}, {}]}                                                                                     | ${undefined}
        ${{ a: 1 }}                                                                                         | ${undefined}
        ${{ a: { b: 1 } }}                                                                                  | ${undefined}
        ${{ a: { a: 'a', b: 42 } }}                                                                         | ${undefined}
        ${{ a: [1] }}                                                                                       | ${undefined}
        ${{ values: ['apple', 'banana', 'pineapple'], set: new Set(['apple', 'banana', 'pineapple']) }}     | ${undefined}
        ${{ values: ['', 'apple', 'banana', 'pineapple'], set: new Set(['apple', 'banana', 'pineapple']) }} | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'c', b: 'd' }, { b: 'b', a: 'a' }, ['a', 'b'], ['c', 'd']]}             | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }]}                 | ${{}}
        ${[{ a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }]}                 | ${{ dedupe: false }}
        ${sampleNestedData()}                                                                               | ${undefined}
        ${sampleRepeatedStrings()}                                                                          | ${undefined}
        ${/[\p{L}\p{M}]+/gu}                                                                                | ${undefined}
        ${[/[\p{L}\p{M}]+/gu, /[\p{L}\p{M}]+/gu, /[\p{Lu}\p{M}]+/gu]}                                       | ${undefined}
        ${[new Date('2024-01-01'), new Date('2024-01-01'), new Date('2024-01-02')]}                         | ${undefined}
        ${[1n, 2n, 1n, 2n, biMaxSafe, -biMaxSafe, biMaxSafe + 1n, -biMaxSafe - 1n]}                         | ${undefined}
        ${[Object(1n), Object('hello'), Object(/\w+/g), Object(null), Object([]), Object('hello')]}         | ${undefined}
    `('dehydrate V2 $data $options', ({ data, options }) => {
        options = { ...options, format: 'V2' };
        const v = toJSON(data, { ...options });
        expect(stringifyFlatpacked(v)).toMatchSnapshot();
        expect(fromJSON(v)).toEqual(data);
        expect(fromJSON(JSON.parse(JSON.stringify(v)))).toEqual(data);
        expect(fromJSON(JSON.parse(stringify(data)))).toEqual(data);
        expect(fromJSON(JSON.parse(stringify(data, false)))).toEqual(data);
        const vv = toJSON(data, { ...options, optimize: true });
        expect(stringifyFlatpacked(vv)).toMatchSnapshot('optimized');
        expect(fromJSON(vv)).toEqual(data);
    });

    test.each`
        name             | data                             | options
        ${'fileList'}    | ${await sampleFileList()}        | ${undefined}
        ${'fileObjects'} | ${await sampleFileListObjects()} | ${undefined}
    `('dehydrate $data $options', async ({ name, data, options }) => {
        const v = toJSON(data, { dedupe: options?.dedupe });
        await expect(stringifyFlatpacked(v)).toMatchFileSnapshot(`__snapshots__/${baseFilename}_${name}.jsonc`);
        await expect(JSON.stringify(v) + '\n').toMatchFileSnapshot(`__snapshots__/${baseFilename}_${name}.json`);
        await expect(JSON.stringify(data) + '\n').toMatchFileSnapshot(
            `__snapshots__/${baseFilename}_${name}.data.json`,
        );
        expect(fromJSON(v)).toEqual(data);
    });

    test("make sure dedupe doesn't break Sets", () => {
        const data = sampleNestedData();
        const value = { ...data, s: new Set(data.n) };

        const v = toJSON(value, { dedupe: true });
        const hv = fromJSON(v) as typeof value;
        expect(hv.s).toEqual(value.s);
        expect(hv.n).toEqual(value.n);
    });

    test.each`
        value
        ${new Set([['a', 'b'], ['c', 'd'], ['c', 'd'], ['a', 'b']])}
        ${new Set([{}, [], {}, []])}
        ${new Set([new Set(), new Set(), new Set()])}
        ${new Set([new Set([1]), new Set([1]), new Set([1])])}
        ${new Set([new Map(), new Map(), new Map()])}
    `("make sure dedupe doesn't break Sets $value", ({ value }) => {
        const v = toJSON(value, { dedupe: true });
        const hv = fromJSON(v);
        expect(hv).toEqual(value);
    });

    test("make sure dedupe doesn't break Maps", () => {
        const data = sampleNestedData();
        const value = { ...data, m: new Map(data.n.map((a) => [a, a])) };

        const v = toJSON(value, { dedupe: true });
        const hv = fromJSON(v) as typeof value;
        expect(hv.m).toEqual(value.m);
        expect(hv.n).toEqual(value.n);
    });
});

describe('v1 to v2', async () => {
    const contentNpmV1 = await fs.readFile(urlNpmV1, 'utf8');

    test('npmV1 to V2', async () => {
        const data = fromJSON(JSON.parse(contentNpmV1));
        expect(fromJSON(toJSON(data, { format: 'V2', dedupe: true }))).toEqual(data);
        const jsonStr = stringify(data, true, { optimize: true, format: 'V2', dedupe: true });
        await fs.writeFile(new URL('.npm-packages-info-v2.json', urlFixtures), jsonStr);

        expect(fromJSON(JSON.parse(jsonStr))).toEqual(data);
    });
});

describe('v2 update value', () => {
    const options = normalizeOptions({ format: 'V2', dedupe: true });
    const optionsOptimize = normalizeOptions({ ...options, optimize: true });

    test('empty object reuse', () => {
        const value = {};
        const options: FlatpackOptions = { format: 'V2', dedupe: true, optimize: true, sortKeys: true };
        const storage = new CompactStorageV2(options);
        const elements = storage.toJSON(value);
        const meta = generateUnpackMetaData(elements);
        storage.useFlatpackMetaData(meta);
        const flat = storage.toJSON(value);
        expect(flat).toEqual(elements);
    });

    test('object reuse', () => {
        interface TT {
            [key: string]: Serializable;
        }
        const data0: TT = { a: { b: 1 }, c: { b: 1 } };
        const flat0 = toJSON(data0, optionsOptimize);
        expect(stringifyFlatpacked(flat0)).toMatchSnapshot('flat0');
        const data1 = fromJSON<TT>(flat0);
        expect(data1).toEqual(data0);

        // Update data1
        data1.a = { b: 2 };
        const flat1 = toJSON(data1, options);
        expect(stringifyFlatpacked(flat1)).toMatchSnapshot('flat1');
        const data2 = fromJSON<TT>(flat1);
        expect(data2).toEqual({ a: { b: 2 }, c: { b: 1 } });

        // Update data2
        data2.b = { b: 1 };
        data2.d = data2.b;

        const flat2 = toJSON(data2, options);
        expect(stringifyFlatpacked(flat2)).toMatchSnapshot('flat2');
        expect(toJSON(Object.assign({}, data2), { ...options, meta: extractUnpackedMetaData(data2) })).toEqual(flat2);
        const data3 = fromJSON<TT>(flat2);
        expect(data3).toEqual({ a: { b: 2 }, b: { b: 1 }, c: { b: 1 }, d: { b: 1 } });

        // Test diffs
        expect(createPatch('data.json', stringifyFlatpacked(flat0), stringifyFlatpacked(flat1))).toMatchSnapshot(
            'diff flat0 -> flat1',
        );

        expect(createPatch('data.json', stringifyFlatpacked(flat1), stringifyFlatpacked(flat2))).toMatchSnapshot(
            'diff flat1 -> flat2',
        );
    });

    test('object reuse with option meta data', () => {
        interface TT {
            [key: string]: Serializable;
        }
        const data0: TT = { a: { b: 1 }, c: { b: 1 } };
        const flat0 = toJSON(data0, optionsOptimize);
        expect(stringifyFlatpacked(flat0)).toMatchSnapshot('flat0');
        const data1 = fromJSON<TT>(flat0);
        expect(data1).toEqual(data0);

        // Update data1
        data1.a = { b: 2 };
        const flat1 = toJSON(data1, options);
        // Use the meta data from data1
        expect(toJSON(Object.assign({}, data1), { ...options, meta: extractUnpackedMetaData(data1) })).toEqual(flat1);
        // Do not use the meta data from data1 and expect a different result.
        expect(toJSON(Object.assign({}, data1), options)).not.toEqual(flat1);
        expect(stringifyFlatpacked(flat1)).toMatchSnapshot('flat1');
        const data2 = fromJSON(flat1);
        expect(data2).toEqual({ a: { b: 2 }, c: { b: 1 } });
    });
});

async function sampleFileList() {
    const data = await fs.readFile(urlFileList, 'utf8');
    const files = data.split('\n');
    return files;
}

async function sampleFileListObjects() {
    const list = await sampleFileList();
    return list.map((filename) => ({ filename, fileType: getFileType(filename) }));
}

function getFileType(filename: string) {
    const baseName = filename.split('/').slice(-1).join('');
    return findMatchingFileTypes(baseName);
}

function sampleRepeatedStrings() {
    const fruit = ['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple'];
    const sentence = 'There is a bit of fruit on the table. Some banana, apple, and pineapple.';
    const joinFruit = fruit.join('-');
    return {
        fruit,
        joinFruit,
        sentence,
    };
}

function sampleNestedData() {
    const a = { a: 'a', b: 'b' };
    const b = { a: 'c', b: 'd' };
    const r = /[\p{L}\p{M}]+/gu;
    const n = [a, b, { b: 'b', a: 'a' }, ['a', 'b'], ['c', 'd'], r, { r, rr: new RegExp(r) }];
    const s = new Set(n);
    const m = new Map([
        ['a', 'a'],
        ['b', 'b'],
    ]);

    const values = ['apple', 'banana', 'pineapple'];
    const rValues = [...values].reverse();
    const cValues = [...values];

    return {
        a,
        b,
        n,
        nn: n,
        nnn: [...n],
        s,
        r,
        m,
        ss: s,
        mm: m,
        values,
        rValues,
        cValues,
    };
}
