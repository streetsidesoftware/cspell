import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { getLanguageIdsForBaseFilename } from '../index.js';
import { dehydrate, hydrate } from './dehydrate.mjs';

const urlFileList = new URL('../../../fixtures/fileList.txt', import.meta.url);

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
        const v = dehydrate(data);
        expect(hydrate(v)).toEqual(data);
    });

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
    `('dehydrate $data $options', ({ data, options }) => {
        const v = dehydrate(data, { dedupe: options?.dedupe });
        expect(v).toMatchSnapshot();
        expect(hydrate(v)).toEqual(data);
        expect(hydrate(JSON.parse(JSON.stringify(v)))).toEqual(data);
    });

    test.each`
        name             | data                             | options
        ${'fileList'}    | ${await sampleFileList()}        | ${undefined}
        ${'fileObjects'} | ${await sampleFileListObjects()} | ${undefined}
    `('dehydrate $data $options', ({ name, data, options }) => {
        const v = dehydrate(data, { dedupe: options?.dedupe });
        expect(v).toMatchFileSnapshot(`__snapshots__/${name}.jsonc`);
        expect(JSON.stringify(v) + '\n').toMatchFileSnapshot(`__snapshots__/${name}.json`);
        expect(JSON.stringify(data) + '\n').toMatchFileSnapshot(`__snapshots__/${name}.data.json`);
        expect(hydrate(v)).toEqual(data);
    });

    test("make sure dedupe doesn't break Sets", () => {
        const data = sampleNestedData();
        const value = { ...data, s: new Set(data.n) };

        const v = dehydrate(value, { dedupe: true });
        const hv = hydrate(v) as typeof value;
        expect(hv.s).toEqual(value.s);
        expect(hv.n).toEqual(value.n);
    });

    test("make sure dedupe doesn't break Maps", () => {
        const data = sampleNestedData();
        const value = { ...data, m: new Map(data.n.map((a) => [a, a])) };

        const v = dehydrate(value, { dedupe: true });
        const hv = hydrate(v) as typeof value;
        expect(hv.m).toEqual(value.m);
        expect(hv.n).toEqual(value.n);
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
    return getLanguageIdsForBaseFilename(baseName);
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
