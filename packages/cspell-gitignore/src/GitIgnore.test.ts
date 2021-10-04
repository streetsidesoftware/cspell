import * as path from 'path';
import { GitIgnore } from './GitIgnore';

const pkg = path.resolve(__dirname, '..');
const gitRoot = path.resolve(pkg, '../..');
const samples = path.resolve(pkg, 'samples');

describe('GitIgnoreServer', () => {
    test('GitIgnoreServer', () => {
        const gs = new GitIgnore();
        expect(gs).toBeInstanceOf(GitIgnore);
    });

    test.each`
        dir                      | expected
        ${__dirname}             | ${[gitRoot, pkg]}
        ${p(samples, 'ignored')} | ${[gitRoot, pkg, samples]}
    `('findGitIgnoreHierarchy $dir', async ({ dir, expected }) => {
        const gs = new GitIgnore();
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.gitIgnoreChain.map((gif) => gif.root)).toEqual(expected);
    });

    // cspell:ignore keepme
    test.each`
        file                               | expected
        ${__filename}                      | ${false}
        ${p(samples, 'ignored/keepme.md')} | ${false}
        ${p(samples, 'ignored/file.txt')}  | ${true}
        ${p(pkg, 'node_modules/bin')}      | ${true}
    `('isIgnored $dir', async ({ file, expected }) => {
        const dir = path.dirname(file);
        const gs = new GitIgnore();
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.isIgnored(file)).toEqual(expected);
    });

    test('isIgnored $dir', async () => {
        const files = [
            __filename,
            p(samples, 'ignored/keepme.md'),
            p(samples, 'ignored/file.txt'),
            p(pkg, 'node_modules/bin'),
        ];
        const gs = new GitIgnore();
        const r = await gs.filterOutIgnored(files);
        expect(r).toEqual([__filename, p(samples, 'ignored/keepme.md')]);
    });

    function p(dir: string, ...dirs: string[]) {
        return path.join(dir, ...dirs);
    }
});
