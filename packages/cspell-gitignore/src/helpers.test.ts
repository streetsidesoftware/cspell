import { describe, expect, test } from 'vitest';

import * as path from 'path';
import { contains, directoryRoot, findRepoRoot, isParentOf } from './helpers';

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

    function p(dir: string, ...dirs: string[]) {
        return path.join(dir, ...dirs);
    }
});
