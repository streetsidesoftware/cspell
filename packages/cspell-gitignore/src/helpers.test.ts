import * as path from 'path';
import { win32 } from 'path';
import { describe, expect, test } from 'vitest';

import { contains, directoryRoot, factoryPathHelper, findRepoRoot, isParentOf, makeRelativeTo } from './helpers';

const pkg = path.resolve(__dirname, '..');
const gitRoot = path.resolve(pkg, '../..');
const samples = path.resolve(pkg, 'samples');

describe('helpers', () => {
    test('directoryRoot', () => {
        const dir = __dirname;
        const r = directoryRoot(dir);
        const p = path.relative(r, dir);
        expect(p).not.toEqual(dir);
        expect(path.resolve(r, p)).toEqual(dir);
    });

    test.each`
        dir          | expected
        ${__dirname} | ${path.join(__dirname, '../../..')}
        ${'/'}       | ${undefined}
    `('findRepoRoot $dir', async ({ dir, expected }) => {
        const f = await findRepoRoot(dir);
        expect(f).toEqual(expected);
    });

    test.each`
        parent     | child                   | expected
        ${pkg}     | ${pkg}                  | ${false}
        ${gitRoot} | ${samples}              | ${true}
        ${samples} | ${gitRoot}              | ${false}
        ${pkg}     | ${p(samples, 'ignore')} | ${true}
    `('isParentOf $parent $child', ({ child, parent, expected }) => {
        expect(isParentOf(parent, child)).toBe(expected);
    });

    test.each`
        parent     | child                   | expected
        ${pkg}     | ${pkg}                  | ${true}
        ${gitRoot} | ${samples}              | ${true}
        ${samples} | ${gitRoot}              | ${false}
        ${pkg}     | ${p(samples, 'ignore')} | ${true}
    `('isParentOf $parent $child', ({ child, parent, expected }) => {
        expect(contains(parent, child)).toBe(expected);
    });

    test.each`
        parent     | child                   | expected
        ${pkg}     | ${pkg}                  | ${''}
        ${gitRoot} | ${samples}              | ${'packages/cspell-gitignore/samples'}
        ${samples} | ${gitRoot}              | ${undefined}
        ${pkg}     | ${p(samples, 'ignore')} | ${'samples/ignore'}
    `('is $parent $child', ({ child, parent, expected }) => {
        expect(makeRelativeTo(child, parent)).toBe(expected);
    });

    function p(dir: string, ...dirs: string[]) {
        return path.join(dir, ...dirs);
    }
});

describe('factoryPathHelper win32', () => {
    const path = win32;
    const { directoryRoot, contains, isParentOf } = factoryPathHelper(path);

    test.each`
        dir                                      | expected
        ${'C:\\user\\project\\code\\myFile.txt'} | ${'C:\\'}
    `('directoryRoot', ({ dir, expected }) => {
        expect(directoryRoot(dir)).toBe(expected);
    });

    test.each`
        parent        | child               | expected
        ${'D:\\user'} | ${'C:\\user\\home'} | ${false}
        ${'C:\\user'} | ${'C:\\user\\home'} | ${true}
        ${'C:\\user'} | ${'C:\\user\\'}     | ${false}
    `('isParentOf $parent $child', ({ child, parent, expected }) => {
        expect(isParentOf(parent, child)).toBe(expected);
    });

    test.each`
        parent        | child               | expected
        ${'D:\\user'} | ${'C:\\user\\home'} | ${false}
        ${'C:\\user'} | ${'C:\\user\\home'} | ${true}
        ${'C:\\user'} | ${'C:\\user\\'}     | ${true}
    `('contains $parent $child', ({ child, parent, expected }) => {
        expect(contains(parent, child)).toBe(expected);
    });
});
