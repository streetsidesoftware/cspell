import { describe, expect, test } from 'vitest';

import { createIntlSegmentTextTransformer } from './IntlSegmentTextTransformer.js';
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

    test('mapRangeBackToOriginalPos needs the length in the transformed text, not the length of the word', () => {
        // cspell:ignore กระดูกสฟีนอยด์ สฟีน อยด์
        const src = 'x กระดูกสฟีนอยด์ y';
        const word = 'กระดูกสฟีนอยด์';
        const { text, map } = createIntlSegmentTextTransformer('th').transform(src);
        // The segmenter inserts soft hyphens inside the word.
        expect(text).toBe('x กระ­ดู­ก­สฟีน­อยด์ y');
        const offset = 2;
        const length = 18; // length in the transformed text, including the soft hyphens.
        expect(text.slice(offset, offset + length).replaceAll('­', '')).toBe(word);

        const expected = [src.indexOf(word), src.indexOf(word) + word.length];
        expect(mapRangeBackToOriginalPos([offset, offset + length], map)).toEqual(expected);
        // Using the length of the word without soft hyphens cuts the range short.
        expect(mapRangeBackToOriginalPos([offset, offset + word.length], map)).not.toEqual(expected);
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
    `('mapRangeToLocal $start $end $map', ({ start, end, map, expected }) => {
        expect(mapRangeToLocal([start, end], mapOffsetPairsToSourceMap(map))).toEqual(expected);
    });
});
