import { readFile } from 'node:fs/promises';

import { findMatchingFileTypes } from '@cspell/filetypes';
import { createPatch } from 'diff';
import { describe, expect, test } from 'vitest';

import { fromJSON } from './dehydrate.mjs';
import { FlatpackStore, stringify, toJSON } from './Flatpack.mjs';
import { stringifyFlatpacked } from './stringify.mjs';

const urlFileList = new URL('../fixtures/fileList.txt', import.meta.url);
const baseFilename = new URL(import.meta.url).pathname.split('/').slice(-1).join('').split('.').slice(0, -2).join('.');

describe('Flatpack', async () => {
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
        ${['apple pie', 'apple', 'banana', 'apple-banana']}                                             | ${undefined}
        ${new Set(['apple', 'banana', 'pineapple'])}                                                    | ${undefined}
        ${new Set(['pineapple', 'apple', 'banana'])}                                                    | ${undefined}
        ${[new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c'])]}               | ${undefined}
        ${new Map([['apple', 1], ['banana', 2], ['pineapple', 3]])}                                     | ${undefined}
        ${[new Map([['a', 1], ['b', 2], ['p', 3]]), new Map([['a', 1], ['b', 2], ['p', 3]])]}           | ${undefined}
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
        expect(fromJSON(JSON.parse(stringify(data)))).toEqual(data);
        expect(fromJSON(JSON.parse(stringify(data, false)))).toEqual(data);
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

    test.each`
        data                        | updated
        ${undefined}                | ${undefined}
        ${'string'}                 | ${'string'}
        ${'string'}                 | ${'string + more'}
        ${['a', 'b', 'a', 'b']}     | ${['a', 'b', 'a', 'b', 'c']}
        ${{}}                       | ${{ a: 'a' }}
        ${{ a: 1 }}                 | ${{ a: 1, b: 1 }}
        ${{ a: { b: 1 } }}          | ${{ a: { b: 1 }, b: { a: 1 } }}
        ${{ a: { a: 'a', b: 42 } }} | ${{ a: { a: 'a', b: 42 }, b: 42 }}
        ${{ a: [1] }}               | ${{ a: [1, 2, 3] }}
    `('Flatpack diff $data, $updated', ({ data, updated }) => {
        const fp = new FlatpackStore(data);
        const s0 = fp.stringify();
        fp.setValue(updated);
        expect(fromJSON(fp.toJSON())).toEqual(updated);
        const s1 = fp.stringify();
        const diff = createPatch('data', s0, s1);
        expect(diff).toMatchSnapshot();
    });
});

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
