import { describe, expect, test } from 'vitest';

import * as TextRange from './TextRange.js';

const { makeSortedMatchRangeArray } = TextRange.__testing__;

describe('Util Text', () => {
    test.each`
        ranges                                                         | expected
        ${[]}                                                          | ${[]}
        ${[{ startPos: 0, endPos: 10 }]}                               | ${[{ startPos: 0, endPos: 10 }]}
        ${[{ startPos: 0, endPos: 10 }, { startPos: 0, endPos: 10 }]}  | ${[{ startPos: 0, endPos: 10 }]}
        ${[{ startPos: 5, endPos: 15 }, { startPos: 0, endPos: 10 }]}  | ${[{ startPos: 0, endPos: 15 }]}
        ${[{ startPos: 11, endPos: 15 }, { startPos: 0, endPos: 10 }]} | ${[{ startPos: 0, endPos: 10 }, { startPos: 11, endPos: 15 }]}
        ${[{ startPos: 10, endPos: 15 }, { startPos: 0, endPos: 10 }]} | ${[{ startPos: 0, endPos: 15 }]}
    `('unionRanges $ranges', ({ ranges, expected }) => {
        const r = TextRange.unionRanges(ranges);
        expect(r).toEqual(makeSortedMatchRangeArray(expected));
    });
});
