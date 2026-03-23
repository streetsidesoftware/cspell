import { readFile } from 'node:fs/promises';

import { findMatchingFileTypes } from '@cspell/filetypes';
import { describe, expect, test } from 'vitest';

import { generateUnpackMetaData } from './flatpacked.mjs';
import { RefCounter } from './RefCounter.mjs';
import { toJSON } from './storage.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import { symbolFlatpackAnnotation } from './types.mjs';
import { fromJSON } from './unpack.mjs';
import { extractUnpackedAnnotation, isAnnotateUnpacked } from './unpackedAnnotation.mjs';

const urlFileList = new URL('../fixtures/fileList.txt', import.meta.url);
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
    `('dehydrate/hydrate $data', ({ data }) => {
        const v = toJSON(data);
        const r = fromJSON(v);
        expect(r).toEqual(data);
        expect(isAnnotateUnpacked(r)).toBe(typeof data === 'object' && data !== null);
        expect(extractUnpackedAnnotation(r)).toEqual(undefined);
    });

    test.each`
        data
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
        const r = fromJSON(v);
        expect(r).toEqual(data);
        expect(isAnnotateUnpacked(r)).toBe(typeof data === 'object' && data !== null);
        expect(symbolFlatpackAnnotation in (r as object)).toBe(true);
        expect(Object.hasOwn(r as object, symbolFlatpackAnnotation)).toBe(true);
        const meta = expect.objectContaining({ flatpack: v, referenced: expect.any(RefCounter) });
        expect(extractUnpackedAnnotation(r)).toEqual({ meta, index: 1 });
    });

    test.each`
        data
        ${undefined}
        ${'string'}
        ${1}
        ${1.1}
        ${null}
        ${true}
        ${false}
    `('dehydrate/hydrate V2 $data', ({ data }) => {
        const v = toJSON(data, { format: 'V2' });
        const r = fromJSON(v);
        expect(r).toEqual(data);
        expect(isAnnotateUnpacked(r)).toBe(typeof data === 'object' && data !== null);
        expect(extractUnpackedAnnotation(r)).toEqual(undefined);
    });

    test.each`
        data
        ${[]}
        ${[1, 2]}
        ${['a', 'b', 'a', 'b']}
        ${{}}
        ${{ a: 1 }}
        ${{ a: { b: 1 } }}
        ${{ a: { a: 'a', b: 42 } }}
        ${{ a: [1] }}
    `('dehydrate/hydrate V2 $data', ({ data }) => {
        const v = toJSON(data, { format: 'V2' });
        const r = fromJSON(v);
        expect(r).toEqual(data);
        expect(isAnnotateUnpacked(r)).toBe(typeof data === 'object' && data !== null);
        expect(symbolFlatpackAnnotation in (r as object)).toBe(true);
        expect(Object.hasOwn(r as object, symbolFlatpackAnnotation)).toBe(true);
        const meta = expect.objectContaining({ flatpack: v, referenced: expect.any(RefCounter) });
        expect(extractUnpackedAnnotation(r)).toEqual({ meta, index: 2 });
        const meta2 = generateUnpackMetaData(v);
        expect(extractUnpackedAnnotation(fromJSON(v))?.meta.referenced.toJSON()).toStrictEqual(
            meta2.referenced.toJSON(),
        );
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
    `('dehydrate $data $options', ({ data, options }) => {
        const v = toJSON(data, { dedupe: options?.dedupe });
        expect(v).toMatchSnapshot();
        expect(fromJSON(v)).toEqual(data);
        expect(fromJSON(JSON.parse(JSON.stringify(v)))).toEqual(data);
    });

    test.each`
        data         | options
        ${undefined} | ${undefined}
        ${'string'}  | ${undefined}
        ${1}         | ${undefined}
        ${1.1}       | ${undefined}
        ${null}      | ${undefined}
        ${true}      | ${undefined}
        ${false}     | ${undefined}
    `('dehydrate V2 $data $options', ({ data, options }) => {
        const v = toJSON(data, { dedupe: options?.dedupe, format: 'V2' });
        expect(v).toMatchSnapshot('flatpack');
        expect(fromJSON(v)).toEqual(data);
        expect(fromJSON(JSON.parse(JSON.stringify(v)))).toEqual(data);
        expect(extractUnpackedAnnotation(fromJSON(v))).toMatchSnapshot('meta');
    });

    test.each`
        data                                                                                            | options
        ${[]}                                                                                           | ${undefined}
        ${[1, 2]}                                                                                       | ${undefined}
        ${['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple']}                                 | ${undefined}
        ${new Set(['apple', 'banana', 'pineapple'])}                                                    | ${undefined}
        ${new Map([['apple', 1], ['banana', 2], ['pineapple', 3]])}                                     | ${undefined}
        ${{}}                                                                                           | ${undefined}
        ${[{}, {}, {}]}                                                                                 | ${undefined}
        ${{ a: 1 }}                                                                                     | ${undefined}
        ${[{ a: undefined, b: undefined }, { a: undefined, b: undefined }]}                             | ${undefined}
        ${{ a: null }}                                                                                  | ${undefined}
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
    `('dehydrate V2 $data $options', ({ data, options }) => {
        const v = toJSON(data, { dedupe: options?.dedupe, format: 'V2' });
        expect(v).toMatchSnapshot('flatpack');
        expect(fromJSON(v)).toEqual(data);
        expect(fromJSON(JSON.parse(JSON.stringify(v)))).toEqual(data);
        expect(extractUnpackedAnnotation(fromJSON(v))).toMatchSnapshot('meta');
        const meta2 = generateUnpackMetaData(v);
        expect(extractUnpackedAnnotation(fromJSON(v))?.meta.referenced.toJSON()).toStrictEqual(
            meta2.referenced.toJSON(),
        );
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

    test("make sure dedupe doesn't break Maps", () => {
        const data = sampleNestedData();
        const value = { ...data, m: new Map(data.n.map((a) => [a, a])) };

        const v = toJSON(value, { dedupe: true });
        const hv = fromJSON(v) as typeof value;
        expect(hv.m).toEqual(value.m);
        expect(hv.n).toEqual(value.n);
    });

    test('circular array', () => {
        const b: CircularArray = ['3', '4'];
        const a: CircularArray = [b, '1', '2'];
        a.push(a);
        b.push(a);
        b.push(b);
        const v = toJSON(a, { format: 'V2' });
        const r = fromJSON(v) as CircularArray;
        expect(r).toEqual([['3', '4', r, r[0]], '1', '2', r]);
        expect(extractUnpackedAnnotation(r)).toMatchSnapshot('meta');
    });

    test('circular object', () => {
        const data: CircularArray = ['data'];
        data.push(data);
        data.push('hello');
        data.push(data);
        const a: CircularObject = { name: 'a', data, head: undefined, tail: undefined };
        const b: CircularObject = { name: 'b', data: 'data', head: a, tail: undefined };
        const c: CircularObject = { name: 'c', data: ['data', 'head', 'name', 'tail'], head: b, tail: a };
        a.tail = b;
        a.head = c;
        const v = toJSON(a, { format: 'V2' });
        const r = fromJSON(v) as CircularObject;
        expect(r).toEqual(a);
        expect(extractUnpackedAnnotation(r)).toMatchSnapshot('meta');
    });
});

type CircularArray<T = string> = (T | CircularArray)[];

type CircularObject = {
    name: string;
    data: string | CircularArray;
    tail?: CircularObject | undefined;
    head?: CircularObject | undefined;
};

async function sampleFileList() {
    const data = await readFile(urlFileList, 'utf8');
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
    return {
        a,
        b,
        n,
        nn: n,
        nnn: [...n],
        s,
        r,
        m,
    };
}
