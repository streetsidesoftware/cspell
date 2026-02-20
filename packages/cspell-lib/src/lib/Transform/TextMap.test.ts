import type { MappedText, SourceMap } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { mergeSourceMaps } from './SourceMap.js';
import {
    calRangeInSrc,
    doesIntersect,
    extractTextMapRangeOrigin,
    mapOffsetToDest,
    mapOffsetToSource,
} from './TextMap.js';

describe('TextMap', () => {
    test.each`
        text                  | range         | map                   | extRange      | expected
        ${'fine café'}        | ${[200, 209]} | ${undefined}          | ${[205, 209]} | ${tm('café', [205, 209])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 4, 1, 7, 7]} | ${[205, 212]} | ${tm('café', [205, 212], [3, 3, 4, 1])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 4, 1, 7, 7]} | ${[200, 212]} | ${tm('fine café', [200, 212], [8, 8, 4, 1, 7, 7])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 4, 1, 7, 7]} | ${[200, 219]} | ${tm('fine café coffee', [200, 219], [8, 8, 4, 1, 7, 7])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 4, 1]}       | ${[205, 212]} | ${tm('café', [205, 212], [3, 3, 7, 4])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 4, 1]}       | ${[205, 219]} | ${tm('café coffee', [205, 219], [3, 3, 4, 1])}
    `('extractTextMap $text $range $map', ({ text, range, map, extRange, expected }) => {
        const tm = { text, range, mapRel: map };
        const r = extractTextMapRangeOrigin(tm, extRange);
        expect(r).toEqual(expected);
    });

    test.each`
        range         | intersectRange | expected
        ${[0, 100]}   | ${[50, 200]}   | ${true}
        ${[100, 110]} | ${[50, 200]}   | ${true}
        ${[190, 210]} | ${[50, 200]}   | ${true}
        ${[200, 210]} | ${[50, 200]}   | ${false}
    `('doesIntersect $range <> $intersectRange', ({ range, intersectRange, expected }) => {
        expect(doesIntersect({ range }, intersectRange)).toBe(expected);
    });

    test('mapOffsetToSource', () => {
        // src: `caf%C3%A9'sGrand`
        // dst: `café's Grand`
        const map = [
            [3, 3], // `caf` / `caf`
            [6, 1], // `%C3%A9` / `é`
            [2, 2], // `'s` / `'s`
            [0, 1], // `` / ` `
            [5, 5], // `Grand` / `Grand`
        ].flat();
        expect(mapOffsetToSource(map, 0)).toBe(0); // `c` -> `c`
        expect(mapOffsetToSource(map, 1)).toBe(1); // `a` -> `a`
        expect(mapOffsetToSource(map, 2)).toBe(2); // `f` -> `f`
        expect(mapOffsetToSource(map, 3)).toBe(3); // `é` -> `%C3%A9`
        expect(mapOffsetToSource(map, 4)).toBe(9); // `'` -> `'`
        expect(mapOffsetToSource(map, 5)).toBe(10); // `s` -> `s`
        expect(mapOffsetToSource(map, 6)).toBe(11); // ` ` -> `` -- space was inserted
        expect(mapOffsetToSource(map, 7)).toBe(11); // `G` -> `G`
        expect(mapOffsetToSource(map, 8)).toBe(12); // `r` -> `r`
        expect(mapOffsetToSource(map, 9)).toBe(13); // `a` -> `a`
        expect(mapOffsetToSource(map, 10)).toBe(14); // `n` -> `n`
        expect(mapOffsetToSource(map, 11)).toBe(15); // `d` -> `d`
        expect(mapOffsetToSource(map, 12)).toBe(16); // beyond the end of the map is considered a 1:1 mapping

        const rev = revMap(map);
        expect(mapOffsetToSource(rev, 0)).toBe(0); // `c` -> `c`
        expect(mapOffsetToSource(rev, 1)).toBe(1); // `a` -> `a`
        expect(mapOffsetToSource(rev, 2)).toBe(2); // `f` -> `f`
        expect(mapOffsetToSource(rev, 3)).toBe(3); // `%` -> 'é'
        expect(mapOffsetToSource(rev, 4)).toBe(3); // `C` -> 'é'
        expect(mapOffsetToSource(rev, 5)).toBe(3); // `3` -> 'é'
        expect(mapOffsetToSource(rev, 6)).toBe(3); // `%` -> 'é'
        expect(mapOffsetToSource(rev, 7)).toBe(3); // `A` -> 'é'
        expect(mapOffsetToSource(rev, 8)).toBe(3); // `9` -> 'é'
        expect(mapOffsetToSource(rev, 9)).toBe(4); // `'` -> `'`
        expect(mapOffsetToSource(rev, 10)).toBe(5); // `s` -> `s`
        expect(mapOffsetToSource(rev, 11)).toBe(6); // `` -> ` `
        expect(mapOffsetToSource(rev, 12)).toBe(8); // `G` -> `G`
        expect(mapOffsetToSource(rev, 13)).toBe(9); // `r` -> `r`
        expect(mapOffsetToSource(rev, 14)).toBe(10); // `a` -> `a`
        expect(mapOffsetToSource(rev, 15)).toBe(11); // `n` -> `n`
    });

    test('mapOffsetToDest', () => {
        // src: `caf%C3%A9'sGrand`
        // dst: `café's Grand`
        const map = [
            [3, 3], // `caf` / `caf`
            [6, 1], // `%C3%A9` / `é`
            [2, 2], // `'s` / `'s`
            [0, 1], // `` / ` `
            [5, 5], // `Grand` / `Grand`
        ].flat();
        const rev = revMap(map);

        expect(mapOffsetToDest(rev, 0)).toBe(0); // `c` -> `c`
        expect(mapOffsetToDest(rev, 1)).toBe(1); // `a` -> `a`
        expect(mapOffsetToDest(rev, 2)).toBe(2); // `f` -> `f`
        expect(mapOffsetToDest(rev, 3)).toBe(3); // `é` -> `%C3%A9`
        expect(mapOffsetToDest(rev, 4)).toBe(9); // `'` -> `'`
        expect(mapOffsetToDest(rev, 5)).toBe(10); // `s` -> `s`
        expect(mapOffsetToDest(rev, 6)).toBe(11); // ` ` -> `` -- space was inserted
        expect(mapOffsetToDest(rev, 7)).toBe(11); // `G` -> `G`
        expect(mapOffsetToDest(rev, 8)).toBe(12); // `r` -> `r`
        expect(mapOffsetToDest(rev, 9)).toBe(13); // `a` -> `a`
        expect(mapOffsetToDest(rev, 10)).toBe(14); // `n` -> `n`
        expect(mapOffsetToDest(rev, 11)).toBe(15); // `d` -> `d`
        expect(mapOffsetToDest(rev, 12)).toBe(16); // beyond the end of the map is considered a 1:1 mapping

        expect(mapOffsetToDest(map, 0)).toBe(0); // `c` -> `c`
        expect(mapOffsetToDest(map, 1)).toBe(1); // `a` -> `a`
        expect(mapOffsetToDest(map, 2)).toBe(2); // `f` -> `f`
        expect(mapOffsetToDest(map, 3)).toBe(3); // `%` -> 'é'
        expect(mapOffsetToDest(map, 4)).toBe(3); // `C` -> 'é'
        expect(mapOffsetToDest(map, 5)).toBe(3); // `3` -> 'é'
        expect(mapOffsetToDest(map, 6)).toBe(3); // `%` -> 'é'
        expect(mapOffsetToDest(map, 7)).toBe(3); // `A` -> 'é'
        expect(mapOffsetToDest(map, 8)).toBe(3); // `9` -> 'é'
        expect(mapOffsetToDest(map, 9)).toBe(4); // `'` -> `'`
        expect(mapOffsetToDest(map, 10)).toBe(5); // `s` -> `s`
        expect(mapOffsetToDest(map, 11)).toBe(6); // `` -> ` `
        expect(mapOffsetToDest(map, 12)).toBe(8); // `G` -> `G`
        expect(mapOffsetToDest(map, 13)).toBe(9); // `r` -> `r`
        expect(mapOffsetToDest(map, 14)).toBe(10); // `a` -> `a`
        expect(mapOffsetToDest(map, 15)).toBe(11); // `n` -> `n`
    });
    test('mapRangeToSource', () => {
        /**
         * |      | 0   | 1      | 2    |
         * |------|-----|--------|------|
         * | src: | caf | é      | 's   |
         * |      | 0-3 | 3-4    | 4-6  |
         * | dst: | caf | %C3%A9 | 's   |
         * |      | 0-3 | 3-9    | 9-11 |
         */
        const map = [3, 3, 1, 6, 2, 2];

        expect(calRangeInSrc(map, [0, 11])).toEqual([0, 6]);
        expect(calRangeInSrc(map, [3, 9])).toEqual([3, 4]);
        expect(calRangeInSrc(map, [9, 11])).toEqual([4, 6]);
        expect(calRangeInSrc(map, [9, 10])).toEqual([4, 5]);
        expect(calRangeInSrc(map, [3, 6])).toEqual([3, 3]);
        expect(calRangeInSrc(map, [3, 3])).toEqual([3, 3]);
    });
});

// cspell:dictionaries html-symbol-entities unicode-escapes

describe('mergeSourceMaps', () => {
    test('mergeSourceMaps', () => {
        /**
         * orig | len |  intermediate | len | final | len |
         * ---- | --- |  ------------ | --- | ----- | --- |
         * 0-3  | 3   |  0-3          | 3   | 0-3   | 3   |
         * 3-7  | 4   |  3-7          | 4   | 3-4   | 1   |
         * 7-8  | 1   |  7-8          | 1   | 4-5   | 1   |
         * 8-12 | 4   |  8-9          | 1   | 5-6   | 1   |
         * 12-19| 7   |  9-16         | 7   | 6-13  | 7   |
         * 19-22| 3   |  16-16        | 0   | 13-13 | 0   |
         * 22-24| 2   |  16-18        | 2   | 13-15 | 2   |
         */
        const map1 = [8, 8, 4, 1, 7, 7, 3, 0, 2, 2];
        const map2 = [3, 3, 4, 1];
        const expected = [3, 3, 4, 1, 1, 1, 4, 1, 7, 7, 3, 0, 2, 2];
        const r = mergeSourceMaps(map1, map2);
        expect(r).toEqual(expected);
    });

    test.each`
        map1            | map2            | expected
        ${[]}           | ${[]}           | ${undefined}
        ${[]}           | ${undefined}    | ${undefined}
        ${undefined}    | ${[]}           | ${undefined}
        ${undefined}    | ${undefined}    | ${undefined}
        ${[1, 8]}       | ${[]}           | ${[1, 8]}
        ${[]}           | ${[0, 0, 3, 3]} | ${[0, 0, 3, 3]}
        ${[0, 0, 8, 8]} | ${[0, 0, 3, 3]} | ${[0, 0, 3, 3, 5, 5]}
    `('mergeSourceMaps $map1, $map2', ({ map1, map2, expected }) => {
        const r = mergeSourceMaps(map1, map2);
        expect(r).toEqual(expected);
    });
});

function tm(text: string, range: [number, number], map?: number[]): MappedText {
    return map ? { text, range, map } : { text, range };
}

function revMap(map: SourceMap): SourceMap {
    const result = [...map];
    for (let i = 0; i < result.length; i += 2) {
        const a = result[i];
        result[i] = result[i + 1];
        result[i + 1] = a;
    }
    return result;
}
