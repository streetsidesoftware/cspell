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

    test('getGlobs', () => {
        const gif = sampleGitIgnoreFile();
        expect(gif.getGlobs(__dirname).sort()).toEqual([
            '**/*.test.*',
            '**/*.test.*/**',
            '**/node_modules',
            '**/node_modules/**',
            'coverage/**',
            'temp',
            'temp/**',
        ]);
    });
});

describe('GitIgnoreHierarchy', () => {
    test.each`
        file                              | expected
        ${rel(__filename)}                | ${true}
        ${rel(p('GitIgnoreFiles.ts'))}    | ${false}
        ${rel(require.resolve('vitest'))} | ${true}
        ${rel(p('package-lock.json'))}    | ${false}
    `('GitIgnoreHierarchy $file', async ({ file, expected }) => {
        file = p(file);
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
        file                              | expected
        ${rel(__filename)}                | ${{ matched: true, gitIgnoreFile: p('./.gitignore'), line: 5, glob: '*.test.*', root: __dirname }}
        ${rp('GitIgnoreFiles.ts')}        | ${undefined}
        ${rel(require.resolve('vitest'))} | ${{ matched: true, gitIgnoreFile, glob: 'node_modules/', line: 59, root: pathRepo }}
        ${rp('package-lock.json')}        | ${undefined}
    `('ignoreEx $file', async ({ file, expected }) => {
        file = p(file);
        // cspell:ignore gifs
        const gifs = [];
        const gi = await loadGitIgnore(path.join(__dirname, '../../..'));
        if (gi) gifs.push(gi);
        gifs.push(sampleGitIgnoreFile());
        const gih = new GitIgnoreHierarchy(gifs);
        expect(gih.isIgnoredEx(file)).toEqual(expected);
    });

    test('getGlobs', async () => {
        const gifs = [];
        const gi = await loadGitIgnore(path.join(__dirname, '../../..'));
        if (gi) gifs.push(gi);
        gifs.push(sampleGitIgnoreFile());
        const gih = new GitIgnoreHierarchy(gifs);
        expect(gih.getGlobs(__dirname).sort()).toEqual(
            expect.arrayContaining(['**/*.cpuprofile', '**/*.cpuprofile/**', '**/*.test.*', '**/*.test.*/**'])
        );
    });

    function rel(filename: string): string {
        return path.relative(__dirname, filename);
    }

    function rp(...filename: string[]): string {
        return rel(p(...filename));
    }

    function p(...filename: string[]): string {
        return path.resolve(__dirname, ...filename);
    }
});

const sampleGitIgnore = `
# Node

node_modules
*.test.*

/temp
/coverage/**

`;

function sampleGitIgnoreFile(): GitIgnoreFile {
    return GitIgnoreFile.parseGitignore(sampleGitIgnore, path.join(__dirname, '.gitignore'));
}

// function oc<T>(v: Partial<T>): T {
//     return expect.objectContaining(v);
// }
