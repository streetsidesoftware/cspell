import { GitIgnoreServer } from './GitIgnoreServer';

describe('GitIgnoreServer', () => {
    test('GitIgnoreServer', () => {
        const gs = new GitIgnoreServer();
        expect(gs).toBeInstanceOf(GitIgnoreServer);
    });
});
