import { describe, expect, test } from 'vitest';

import { mapRangeBackToOriginalPos, mapRangeToLocal } from './parsedText.js';
import { mapOffsetPairsToSourceMap } from './SourceMap.js';

describe('parsedText', () => {
    test.each`
        start | end   | map                     | expected
        ${0}  | ${0}  | ${[]}                   | ${[0, 0]}
        ${5}  | ${10} | ${[]}                   | ${[5, 10]}
        ${5}  | ${10} | ${undefined}            | ${[5, 10]}
        ${5}  | ${5}  | ${[5, 5, 9, 6, 19, 16]} | ${[5, 5]}
        ${5}  | ${6}  | ${[5, 5, 9, 6, 19, 16]} | ${[5, 9]}
        ${5}  | ${7}  | ${[5, 5, 9, 6, 19, 16]} | ${[5, 10]}
        ${6}  | ${11} | ${[5, 5, 9, 6, 19, 16]} | ${[9, 14]}
        ${6}  | ${17} | ${[5, 5, 9, 6, 19, 16]} | ${[9, 20]}
        ${0}  | ${17} | ${[5, 5, 9, 6, 19, 16]} | ${[0, 20]}
    `('mapRangeBackToOriginalPos $start $end $map', ({ start, end, map, expected }) => {
        expect(mapRangeBackToOriginalPos([start, end], mapOffsetPairsToSourceMap(map))).toEqual(expected);
    });

    test.each`
        start | end   | map                           | expected
        ${0}  | ${0}  | ${[]}                         | ${[0, 0]}
        ${5}  | ${10} | ${[]}                         | ${[5, 10]}
        ${5}  | ${10} | ${undefined}                  | ${[5, 10]}
        ${6}  | ${14} | ${[5, 5, 9, 6, 19, 16]}       | ${[5, 11]}
        ${6}  | ${20} | ${[5, 5, 9, 6, 19, 16]}       | ${[5, 17]}
        ${0}  | ${20} | ${[5, 5, 9, 6, 19, 16]}       | ${[0, 17]}
        ${6}  | ${14} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[5, 11]}
        ${6}  | ${20} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[5, 17]}
        ${0}  | ${30} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[0, 27]}
    `('mapRangeBackToOriginalPos $start $end $map', ({ start, end, map, expected }) => {
        expect(mapRangeToLocal([start, end], mapOffsetPairsToSourceMap(map))).toEqual(expected);
    });
});
