import { loadGitIgnoreFile, GitIgnoreFile } from './GitIgnoreFile';

describe('GitIgnoreFile', () => {
    test('GitIgnoreFile', () => {
        const gif = new GitIgnoreFile('', '');
        expect(gif).toBeInstanceOf(GitIgnoreFile);
    });

    test('loadGitIgnoreFile', () => {
        expect(typeof loadGitIgnoreFile).toBe('function');
    });
});
