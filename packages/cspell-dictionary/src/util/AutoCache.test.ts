import { autoCache, extractStats } from './AutoCache';

describe('AutoCache', () => {
    test.each`
        sequence                                | size | expected
        ${[]}                                   | ${3} | ${{ hits: 0, misses: 0, swaps: 0 }}
        ${[1, 1, 1, 1, 1]}                      | ${1} | ${{ hits: 4, misses: 1, swaps: 0 }}
        ${[1, 1, 2, 1, 1, 2, 2, 1, 2, 1, 2]}    | ${1} | ${{ hits: 9, misses: 2, swaps: 1 }}
        ${[1, 1, 2, 1, 1, 2, 2, 1, 3, 1, 2, 3]} | ${1} | ${{ hits: 9, misses: 3, swaps: 2 }}
        ${[1, 1, 2, 2, 1, 2, 2, 1, 3, 1, 2, 3]} | ${1} | ${{ hits: 9, misses: 3, swaps: 2 }}
        ${[1, 2, 3, 1, 2, 3, 1, 2, 3]}          | ${1} | ${{ hits: 0, misses: 9, swaps: 8 } /* this is the worst case. */}
    `('autoCache', ({ sequence, size, expected }) => {
        const cache = autoCache((a) => a, size);
        for (const val of sequence) {
            expect(cache(val)).toBe(val);
        }
        expect(extractStats(cache)).toEqual(expected);
    });
});
