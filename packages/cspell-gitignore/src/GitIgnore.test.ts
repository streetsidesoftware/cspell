import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { VFileSystem } from 'cspell-io';
import { beforeAll, describe, expect, test } from 'vitest';

import { GitIgnore } from './GitIgnore.js';

const dirUrl = new URL('.', import.meta.url);

const pkgUrl = new URL('../', dirUrl);
const packagesUrl = new URL('../', pkgUrl);
const gitRootUrl = new URL('../', packagesUrl);
const samplesUrl = new URL('samples/', pkgUrl);
const pkgCSpellLibUrl = new URL('cspell-lib/', packagesUrl);
const gitIgnoreFileUrl = new URL('.gitignore', gitRootUrl);

const pkg = fileURLToPath(pkgUrl);
const packages = fileURLToPath(packagesUrl);
const gitRoot = fileURLToPath(gitRootUrl);
const samples = fileURLToPath(samplesUrl);
const pkgCSpellLib = fileURLToPath(pkgCSpellLibUrl);
const gitIgnoreFile = fileURLToPath(gitIgnoreFileUrl);
// const pathSamples = path.resolve(pkg, 'samples');
// const gitIgnoreSamples = path.resolve(pathSamples, '.gitignore');

const pathTemp = path.join(pkg, 'temp/GitIgnore');
const pathPlain = path.join(pathTemp, 'plain');
const pathClone = path.join(pathPlain, 'clone');
const pathWorktree = path.join(pathClone, 'worktrees/wt');
const pathSubmodule = path.join(pathClone, 'vendor/sub');

const oc = (obj: unknown) => expect.objectContaining(obj);

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
        ${dirUrl.href}           | ${[pkgUrl.href]}  | ${[pkg]}
        ${p(samples, 'ignored')} | ${undefined}      | ${[gitRoot, pkg, samples]}
        ${p(pkgCSpellLib)}       | ${[pkg]}          | ${[gitRoot, pkgCSpellLib]}
        ${p(pkgCSpellLib)}       | ${[packages]}     | ${[pkgCSpellLib]}
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
        ${p(samples, 'ignored/file.txt')}  | ${undefined}               | ${{ glob: 'ignored/**', matched: true, line: 3, root: pr(samples), gitIgnoreFile: p(samples, '.gitignore') }}
        ${p(pkg, 'node_modules/bin')}      | ${undefined}               | ${oc({ glob: 'node_modules/', matched: true, root: pr(gitRoot), gitIgnoreFile: gitIgnoreFile })}
        ${p(pkg, 'node_modules/')}         | ${undefined}               | ${oc({ glob: 'node_modules/', matched: true, root: pr(gitRoot), gitIgnoreFile: gitIgnoreFile })}
        ${__filename}                      | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(samples, 'ignored/keepme.md')} | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(samples, 'ignored/file.txt')}  | ${[p(samples, 'ignored')]} | ${undefined}
        ${p(pkg, 'node_modules/bin')}      | ${[p(samples, 'ignored')]} | ${oc({ glob: 'node_modules/', matched: true, root: pr(gitRoot), gitIgnoreFile: gitIgnoreFile })}
    `('isIgnoredEx $file $roots', async ({ file, roots, expected }) => {
        const dir = path.dirname(file);
        const gs = new GitIgnore(roots);
        const r = await gs.findGitIgnoreHierarchy(dir);
        expect(r.isIgnoredEx(file)).toEqual(expected);
    });

    test.each`
        file                       | roots        | expected
        ${p(pkg, 'node_modules/')} | ${undefined} | ${oc({ glob: 'node_modules/', matched: true, root: pr(gitRoot), gitIgnoreFile: gitIgnoreFile })}
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
            p(pkg, 'node_modules/'),
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

    describe('nested repositories', () => {
        // A clone with a worktree and a submodule inside it, all in a folder that is not a repository.
        beforeAll(async () => {
            await fs.rm(pathTemp, { force: true, recursive: true });
            await fs.mkdir(path.join(pathClone, '.git'), { recursive: true });
            await fs.mkdir(pathWorktree, { recursive: true });
            await fs.mkdir(pathSubmodule, { recursive: true });
            await fs.writeFile(path.join(pathTemp, '.gitignore'), '*.log\n');
            await fs.writeFile(path.join(pathPlain, '.gitignore'), '*.tmp\n');
            await fs.writeFile(path.join(pathClone, '.gitignore'), 'worktrees/\n*.md\n');
            await fs.writeFile(path.join(pathWorktree, '.git'), 'gitdir: ../../.git/worktrees/wt\n');
            await fs.writeFile(path.join(pathWorktree, '.gitignore'), '*.txt\n');
            await fs.writeFile(path.join(pathSubmodule, '.git'), 'gitdir: ../../.git/modules/sub\n');
        });

        test.each`
            file                             | roots          | expected
            ${p(pathClone, 'README.md')}     | ${[pathTemp]}  | ${true}
            ${p(pathClone, 'notes.tmp')}     | ${[pathTemp]}  | ${false}
            ${p(pathWorktree, 'README.md')}  | ${[pathTemp]}  | ${false}
            ${p(pathWorktree, 'notes.txt')}  | ${[pathTemp]}  | ${true}
            ${p(pathWorktree, 'README.md')}  | ${[pathClone]} | ${false}
            ${p(pathWorktree, 'README.md')}  | ${[]}          | ${false}
            ${p(pathSubmodule, 'README.md')} | ${[pathTemp]}  | ${false}
            ${p(pathSubmodule, 'README.md')} | ${[]}          | ${false}
            ${p(pathPlain, 'notes.tmp')}     | ${[pathTemp]}  | ${true}
            ${p(pathPlain, 'notes.log')}     | ${[pathTemp]}  | ${true}
            ${p(pathPlain, 'notes.log')}     | ${[pathPlain]} | ${false}
        `('isIgnored $file $roots', async ({ file, roots, expected }) => {
            const gs = new GitIgnore(roots);
            expect(await gs.isIgnored(file)).toBe(expected);
        });
    });

    describe('nested repositories on a remote file system', () => {
        const base = 'vscode-vfs://github/owner/';
        const files = new Map([
            [base + '.gitignore', '*.md\n'],
            [base + 'repo/.git', ''],
        ]);

        test.each`
            file                           | expected
            ${base + 'README.md'}          | ${true}
            ${base + 'repo/README.md'}     | ${false}
            ${base + 'repo/src/README.md'} | ${false}
        `('isIgnored $file', async ({ file, expected }) => {
            const gs = new GitIgnore([], createRemoteFs(files));
            expect(await gs.isIgnored(new URL(file))).toBe(expected);
        });
    });

    function p(dir: string, ...dirs: string[]) {
        return path.join(dir, ...dirs);
    }

    function pr(...dirs: string[]) {
        return path.join(path.resolve(...dirs), './');
    }

    /**
     * A read-only file system for a scheme other than `file:`, like the remote ones in the VS Code extension.
     */
    function createRemoteFs(files: Map<string, string>): VFileSystem {
        const find = async (url: URL) => {
            const content = files.get(url.href);
            if (content === undefined) throw new Error(`Not found: ${url.href}`);
            return content;
        };
        const fs = {
            stat: async (url: URL) => (await find(url), {}),
            readFile: async (url: URL) => {
                const content = await find(url);
                return { url, content, getText: () => content };
            },
        };
        return fs as unknown as VFileSystem;
    }
});
