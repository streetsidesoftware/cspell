import { GlobMatcher } from 'cspell-glob';
import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { __testing__, GitIgnoreFile, GitIgnoreHierarchy, loadGitIgnore } from './GitIgnoreFile';

const { mustBeHierarchical } = __testing__;

const pathPackage = path.resolve(__dirname, '..');
const pathRepo = path.resolve(pathPackage, '../..');
const gitIgnoreFile = path.resolve(pathRepo, '.gitignore');

describe('GitIgnoreFile', () => {
    test('GitIgnoreFile', () => {
        const gif = sampleGitIgnoreFile();
        expect(gif).toBeInstanceOf(GitIgnoreFile);
    });

    test.each`
        file                                       | expected
        ${__filename}                              | ${true}
        ${path.join(__dirname, 'file.ts')}         | ${false}
        ${path.join(__dirname, '../file.test.ts')} | ${false}
    `('isIgnored $file', ({ file, expected }) => {
        const gif = sampleGitIgnoreFile();
        expect(gif.isIgnored(file)).toBe(expected);
    });

    test('loadGitIgnoreFile .gitignore', async () => {
        const gif = await loadGitIgnore(path.join(__dirname, '../../..'));
        expect(gif?.isIgnored(require.resolve('vitest'))).toBe(true);
    });
});

describe('GitIgnoreHierarchy', () => {
    test.each`
        file                         | expected
        ${__filename}                | ${true}
        ${p('GitIgnoreFiles.ts')}    | ${false}
        ${require.resolve('vitest')} | ${true}
        ${p('package-lock.json')}    | ${false}
    `('GitIgnoreHierarchy $file', async ({ file, expected }) => {
        // cspell:ignore gifs
        const gifs = [];
        const gi = await loadGitIgnore(path.join(__dirname, '../../..'));
        if (gi) gifs.push(gi);
        gifs.push(sampleGitIgnoreFile());
        const gih = new GitIgnoreHierarchy(gifs);
        expect(gih.isIgnored(file)).toBe(expected);
    });

    test('mustBeHierarchical throws', () => {
        expect(() =>
            mustBeHierarchical([
                new GitIgnoreFile(new GlobMatcher('', __dirname), ''),
                new GitIgnoreFile(new GlobMatcher('', path.join(__dirname, '..')), ''),
            ])
        ).toThrow('Hierarchy violation - files are not nested');
    });

    test.each`
        file                         | expected
        ${__filename}                | ${{ matched: true, gitIgnoreFile: p('./.gitignore'), line: undefined, glob: '*.test.*', root: __dirname }}
        ${p('GitIgnoreFiles.ts')}    | ${undefined}
        ${require.resolve('vitest')} | ${{ matched: true, gitIgnoreFile, glob: 'node_modules/', line: 59, root: pathRepo }}
        ${p('package-lock.json')}    | ${undefined}
    `('ignoreEx $file', async ({ file, expected }) => {
        // cspell:ignore gifs
        const gifs = [];
        const gi = await loadGitIgnore(path.join(__dirname, '../../..'));
        if (gi) gifs.push(gi);
        gifs.push(sampleGitIgnoreFile());
        const gih = new GitIgnoreHierarchy(gifs);
        expect(gih.isIgnoredEx(file)).toEqual(expected);
    });

    function p(...files: string[]): string {
        return path.resolve(__dirname, ...files);
    }
});

const sampleGitIgnore = `
# Node

node_modules
*.test.*

`;

function sampleGlobMatcher(): GlobMatcher {
    return new GlobMatcher(sampleGitIgnore, __dirname);
}

function sampleGitIgnoreFile(): GitIgnoreFile {
    const m = sampleGlobMatcher();
    const file = path.join(m.root, '.gitignore');
    return new GitIgnoreFile(m, file);
}

// function oc<T>(v: Partial<T>): T {
//     return expect.objectContaining(v);
// }
