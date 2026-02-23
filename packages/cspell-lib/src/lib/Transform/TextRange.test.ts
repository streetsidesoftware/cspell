import { describe, expect, test } from 'vitest';

import * as TextRange from './TextRange.js';

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
        expect(r.values).toEqual(expected);
    });
});
