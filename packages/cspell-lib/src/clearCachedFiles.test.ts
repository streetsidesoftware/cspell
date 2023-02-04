import * as clearCachedFiles from './clearCachedFiles';

describe('clearCachedFiles', () => {
    test('clearCachedFiles', async () => {
        await expect(clearCachedFiles.clearCachedFiles()).resolves.not.toThrow();
    });
});
