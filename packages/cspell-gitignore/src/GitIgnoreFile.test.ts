import { GlobMatcher } from 'cspell-glob';
import * as path from 'path';
import { GitIgnoreFile, GitIgnoreHierarchy, loadGitIgnore, __testing__ } from './GitIgnoreFile';

const { mustBeHierarchical } = __testing__;

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
        expect(gif?.isIgnored(require.resolve('jest'))).toBe(true);
    });
});

describe('GitIgnoreHierarchy', () => {
    test.each`
        file                       | expected
        ${__filename}              | ${true}
        ${p('GitIgnoreFiles.ts')}  | ${false}
        ${require.resolve('jest')} | ${true}
        ${p('package-lock.json')}  | ${false}
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
        ).toThrowError('Hierarchy violation - files are not nested');
    });

    function p(file: string): string {
        return path.join(__dirname, file);
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
