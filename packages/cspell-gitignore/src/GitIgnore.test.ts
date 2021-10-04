import * as path from 'path';
import { GitIgnore } from './GitIgnore';

const pkg = path.resolve(__dirname, '..');
const packages = path.resolve(pkg, '..');
const gitRoot = path.resolve(packages, '..');
const samples = path.resolve(pkg, 'samples');
const pkgCSpellLib = path.join(packages, 'cspell-lib');

describe('GitIgnoreServer', () => {
    test('GitIgnoreServer', () => {
        const gs = new GitIgnore();
        expect(gs).toBeInstanceOf(GitIgnore);
    });

    test.each`
        dir                      | roots             | expected
        ${__dirname}             | ${undefined}      | ${[gitRoot, pkg]}
        ${__dirname}             | ${[packages]}     | ${[pkg]}
        ${__dirname}             | ${[pkg, gitRoot]} | ${[pkg]}
        ${p(samples, 'ignored')} | ${undefined}      | ${[gitRoot, pkg, samples]}
        ${p(pkgCSpellLib)}       | ${[pkg]}          | ${[gitRoot]}
        ${p(pkgCSpellLib)}       | ${[packages]}     | ${[]}
    `('findGitIgnoreHierarchy $dir $roots', async ({ dir, roots, expected }) => {
        const gs = new GitIgnore(roots);
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
    `('isIgnored $file', async ({ file, expected }) => {
        const dir = path.dirname(file);
        const gs = new GitIgnore();
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.isIgnored(file)).toEqual(expected);
    });

    test('isIgnored files', async () => {
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
