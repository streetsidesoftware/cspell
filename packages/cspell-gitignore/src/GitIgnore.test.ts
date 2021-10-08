import * as path from 'path';
import { GitIgnore } from './GitIgnore';

const pkg = path.resolve(__dirname, '..');
const packages = path.resolve(pkg, '..');
const gitRoot = path.resolve(packages, '..');
const samples = path.resolve(pkg, 'samples');
const pkgCSpellLib = path.join(packages, 'cspell-lib');
const gitIgnoreFile = path.resolve(gitRoot, '.gitignore');
// const pathSamples = path.resolve(pkg, 'samples');
// const gitIgnoreSamples = path.resolve(pathSamples, '.gitignore');

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
        file                               | roots                      | expected
        ${__filename}                      | ${undefined}               | ${false}
        ${p(samples, 'ignored/keepme.md')} | ${undefined}               | ${false}
        ${p(samples, 'ignored/file.txt')}  | ${undefined}               | ${true}
        ${p(pkg, 'node_modules/bin')}      | ${undefined}               | ${true}
        ${__filename}                      | ${[p(samples, 'ignored')]} | ${false}
        ${p(samples, 'ignored/keepme.md')} | ${[p(samples, 'ignored')]} | ${false}
        ${p(samples, 'ignored/file.txt')}  | ${[p(samples, 'ignored')]} | ${false}
        ${p(pkg, 'node_modules/bin')}      | ${[p(samples, 'ignored')]} | ${true}
    `('isIgnored $file $roots', async ({ file, roots, expected }) => {
        const dir = path.dirname(file);
        const gs = new GitIgnore(roots);
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.isIgnored(file)).toEqual(expected);
    });

    // cspell:ignore keepme
    test.each`
        file                               | roots                      | expected
        ${__filename}                      | ${undefined}               | ${undefined}
        ${p(samples, 'ignored/keepme.md')} | ${undefined}               | ${undefined}
        ${p(samples, 'ignored/file.txt')}  | ${undefined}               | ${{ glob: 'ignored/**', matched: true, line: 3, root: samples, gitIgnoreFile: p(samples, '.gitignore') }}
        ${p(pkg, 'node_modules/bin')}      | ${undefined}               | ${{ glob: 'node_modules/', matched: true, line: 58, root: gitRoot, gitIgnoreFile: gitIgnoreFile }}
        ${__filename}                      | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(samples, 'ignored/keepme.md')} | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(samples, 'ignored/file.txt')}  | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(pkg, 'node_modules/bin')}      | ${[p(samples, 'ignored')]} | ${{ glob: 'node_modules/', matched: true, line: 58, root: gitRoot, gitIgnoreFile: gitIgnoreFile }}
    `('isIgnoredEx $file $roots', async ({ file, roots, expected }) => {
        const dir = path.dirname(file);
        const gs = new GitIgnore(roots);
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.isIgnoredEx(file)).toEqual(expected);
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

    test.each`
        file                               | roots        | addRoots                   | expectedBefore | expectedAfter
        ${__filename}                      | ${undefined} | ${[p(samples, 'ignored')]} | ${false}       | ${false}
        ${p(samples, 'ignored/keepme.md')} | ${undefined} | ${[p(samples, 'ignored')]} | ${false}       | ${false}
        ${p(samples, 'ignored/file.txt')}  | ${undefined} | ${[p(samples, 'ignored')]} | ${true}        | ${false}
        ${p(pkg, 'node_modules/bin')}      | ${undefined} | ${[p(samples, 'ignored')]} | ${true}        | ${true}
    `('addRoots $file $addRoots', async ({ file, roots, addRoots, expectedBefore, expectedAfter }) => {
        const gs = new GitIgnore(roots);
        const before = await gs.isIgnored(file);
        expect(before).toEqual(expectedBefore);
        gs.addRoots(addRoots);
        const after = await gs.isIgnored(file);
        expect(after).toEqual(expectedAfter);
    });

    test('addRoots only reset cache if a new root is added', async () => {
        const dir = p(samples, 'ignored');
        const gs = new GitIgnore();
        gs.findGitIgnoreHierarchy(dir);
        const p0 = gs.peekGitIgnoreHierarchy(dir);
        expect(p0).toBeDefined();
        gs.addRoots([dir]);
        expect(gs.peekGitIgnoreHierarchy(dir)).toBeUndefined();
        gs.findGitIgnoreHierarchy(dir);
        const p1 = gs.peekGitIgnoreHierarchy(dir);
        expect(p1).not.toBe(p0);
        gs.addRoots([dir]);
        expect(gs.peekGitIgnoreHierarchy(dir)).toBe(p1);
        gs.findGitIgnoreHierarchy(dir);
        expect(gs.peekGitIgnoreHierarchy(dir)).toBe(p1);
    });

    function p(dir: string, ...dirs: string[]) {
        return path.join(dir, ...dirs);
    }
});
