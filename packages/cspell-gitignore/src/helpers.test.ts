import { directoryRoot, findRepoRoot, isParentOf, contains } from './helpers';
import * as path from 'path';

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

    test('findRepoRoot', async () => {
        const f = await findRepoRoot(__dirname);
        expect(f).toEqual(path.join(__dirname, '../../..'));
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
