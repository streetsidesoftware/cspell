import { compareStats } from './stat';

describe('stat', () => {
    const stats = {
        urlA: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0db5918"', mtimeMs: 0, size: -1 },
        urlB: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0dbffff"', mtimeMs: 0, size: -1 },
        file1: { mtimeMs: 1658757408444.0342, size: 1886 },
        file2: { mtimeMs: 1658757408444.0342, size: 2886 },
        file3: { mtimeMs: 1758757408444.0342, size: 1886 },
    };

    test.each`
        left           | right          | expected
        ${stats.urlA}  | ${stats.urlA}  | ${0}
        ${stats.urlA}  | ${stats.urlB}  | ${-1}
        ${stats.urlA}  | ${stats.file1} | ${1}
        ${stats.file1} | ${stats.file1} | ${0}
        ${stats.file1} | ${stats.file2} | ${-1}
        ${stats.file1} | ${stats.file3} | ${-1}
        ${stats.file2} | ${stats.file1} | ${1}
        ${stats.file3} | ${stats.file1} | ${1}
        ${stats.file2} | ${stats.file3} | ${1}
    `('getStat $left <> $right', async ({ left, right, expected }) => {
        const r = compareStats(left, right);
        expect(r).toEqual(expected);
    });
});
