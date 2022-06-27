import { MappedText } from '@cspell/cspell-types';
import { extractTextMapRangeOrigin, doesIntersect } from './TextMap';

describe('TextMap', () => {
    test.each`
        text                  | range         | map                      | extRange      | expected
        ${'fine café'}        | ${[200, 209]} | ${undefined}             | ${[205, 209]} | ${tm('café', [205, 209])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 12, 9, 19, 16]} | ${[205, 212]} | ${tm('café', [205, 212], [3, 3, 7, 4])}
        ${'fine café coffee'} | ${[200, 219]} | ${[0, 0, 8, 8, 12, 9]}   | ${[205, 212]} | ${tm('café', [205, 212], [3, 3, 7, 4])}
        ${'fine café coffee'} | ${[200, 219]} | ${[0, 0, 8, 8, 12, 9]}   | ${[205, 219]} | ${tm('café coffee', [205, 219], [3, 3, 7, 4, 14, 11])}
    `('extractTextMap $text $range $map', ({ text, range, map, extRange, expected }) => {
        const tm = { text, range, map };
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
});

function tm(text: string, range: [number, number], map?: number[]): MappedText {
    return map ? { text, range, map } : { text, range };
}
