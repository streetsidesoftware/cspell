import assert from 'node:assert';

import type { MappedText, SubstitutionDefinition } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import type { SubstitutionInfo } from './SubstitutionTransformer.js';
import { createSubstitutionTransformer } from './SubstitutionTransformer.js';
import {
    doesIntersect,
    extractTextMapRangeOrigin,
    mapOffsetToSource,
    mapRangeToSource,
    mergeSourceMaps,
} from './TextMap.js';

describe('TextMap', () => {
    test.each`
        text                  | range         | map                      | extRange      | expected
        ${'fine café'}        | ${[200, 209]} | ${undefined}             | ${[205, 209]} | ${tm('café', [205, 209])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 12, 9, 19, 16]} | ${[205, 212]} | ${tm('café', [205, 212], [3, 3, 7, 4])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 12, 9, 19, 16]} | ${[200, 212]} | ${tm('fine café', [200, 212], [8, 8, 12, 9])}
        ${'fine café coffee'} | ${[200, 219]} | ${[8, 8, 12, 9, 19, 16]} | ${[200, 219]} | ${tm('fine café coffee', [200, 219], [8, 8, 12, 9, 19, 16])}
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

    test('mapOffsetToSource begin', () => {
        const map = [
            [0, 0], // linear text from 0 to 8
            [8, 8], // 4:1
            [12, 9], // linear text
            [19, 16], // 3:0
            [22, 16], // linear text
            [24, 18],
        ].flat();
        expect(mapOffsetToSource(map, 0)).toBe(0);
        expect(mapOffsetToSource(map, 1)).toBe(1);
        expect(mapOffsetToSource(map, 7)).toBe(7);
        expect(mapOffsetToSource(map, 8)).toBe(8);
        expect(mapOffsetToSource(map, 9)).toBe(12);
        expect(mapOffsetToSource(map, 10)).toBe(13);
        expect(mapOffsetToSource(map, 15)).toBe(18);
        expect(mapOffsetToSource(map, 16)).toBe(19);
        expect(mapOffsetToSource(map, 17)).toBe(23);
        expect(mapOffsetToSource(map, 18)).toBe(24);
        expect(mapOffsetToSource(map, 19)).toBe(25);
        expect(mapOffsetToSource(map, 20)).toBe(26);
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
        const map = [0, 0, 3, 3, 4, 9, 6, 11];

        expect(mapRangeToSource(map, [0, 11])).toEqual([0, 6]);
        expect(mapRangeToSource(map, [3, 9])).toEqual([3, 4]);
        expect(mapRangeToSource(map, [9, 11])).toEqual([4, 6]);
        expect(mapRangeToSource(map, [9, 10])).toEqual([4, 5]);
        expect(mapRangeToSource(map, [3, 6])).toEqual([3, 4]);
        expect(mapRangeToSource(map, [3, 3])).toEqual([3, 3]);
    });
});

// cspell:dictionaries html-symbol-entities unicode-escapes

describe('mergeSourceMaps', () => {
    test('mergeSourceMaps', () => {
        /**
         * orig |  intermediate | final |
         * ---- |  ------------ | ----- |
         * 0-3  |  0-3          | 0-3   |
         * 3-7  |  3-7          | 3-4
         * 7-8. |  7-8          | 4-5
         * 8-12 |  8-9          | 5-6
         * 12-19|  9-16         | 6-13
         * 19-22|  16-16        | 13-13
         * 22-24|  16-18        | 13-15
         */
        const map1 = [0, 0, 8, 8, 12, 9, 19, 16, 22, 16, 24, 18];
        const map2 = [0, 0, 3, 3, 7, 4];
        const expected = [0, 0, 3, 3, 7, 4, 8, 5, 12, 6, 19, 13, 22, 13, 24, 15];
        const r = mergeSourceMaps(map1, map2);
        expect(r).toEqual(expected);
    });

    test.each`
        map1            | map2            | expected
        ${[]}           | ${[]}           | ${undefined}
        ${[]}           | ${undefined}    | ${undefined}
        ${undefined}    | ${[]}           | ${undefined}
        ${undefined}    | ${undefined}    | ${undefined}
        ${[0, 0, 8, 8]} | ${[]}           | ${[0, 0, 8, 8]}
        ${[]}           | ${[0, 0, 3, 3]} | ${[0, 0, 3, 3]}
        ${[0, 0, 8, 8]} | ${[0, 0, 3, 3]} | ${[0, 0, 3, 3, 8, 8]}
    `('mergeSourceMaps $map1, $map2', ({ map1, map2, expected }) => {
        const r = mergeSourceMaps(map1, map2);
        expect(r).toEqual(expected);
    });
});

describe('Substitution Assumptions', () => {
    const tFromUri = makeTransformer('uri-escapes');
    const tToUri = makeTransformer('uri-escapes-rev');
    const tFromHtml = makeTransformer('html-symbol-entities');
    const tToHtml = makeTransformer('html-symbol-entities-rev');

    test('assumptions', () => {
        expect(tFromUri.transform('caf%C3%A9')).toEqual({
            text: 'café',
            range: [0, 9],
            map: [0, 0, 3, 3, 9, 4],
        });
        expect(tToUri.transform("café's")).toEqual({
            text: "caf%C3%A9's",
            range: [0, 6],
            map: [0, 0, 3, 3, 4, 9, 6, 11],
        });
        expect(tFromHtml.transform('caf&#233;')).toEqual({
            text: 'café',
            range: [0, 9],
            map: [0, 0, 3, 3, 9, 4],
        });
        expect(tToHtml.transform("café's")).toEqual({
            text: 'caf&#233;&apos;s',
            range: [0, 6],
            map: [0, 0, 3, 3, 4, 9, 5, 15, 6, 16],
        });

        expect(tToHtml.transform("café's $")).toEqual({
            text: 'caf&#233;&apos;s &#36;',
            range: [0, 8],
            map: [0, 0, 3, 3, 4, 9, 5, 15, 7, 17, 8, 22],
        });

        expect(tFromHtml.transform(tToHtml.transform("café's $").text).text).toEqual("café's $");
        expect(tToUri.transform(tToHtml.transform("café's $").text).text).toEqual(
            'caf%26%23233%3B%26apos%3Bs%20%26%2336%3B',
        );
        expect(tFromHtml.transform(tFromUri.transform('caf%26%23233%3B%26apos%3Bs%20%26%2336%3B').text).text).toEqual(
            "café's $",
        );
        expect(tFromUri.transform('caf%26%23233%3B%26apos%3Bs%20%26%2336%3B').text).toEqual('caf&#233;&apos;s &#36;');
    });
});

const subDefs = {
    'html-symbol-entities': {
        name: 'html-symbol-entities',
        entries: [...mapHtmlEntities()],
    },
    'unicode-escapes': {
        name: 'unicode-escapes',
        entries: [
            ['\\u00e9', 'é'],
            ['\\u00f8', 'ø'],
            ['\\u00e6', 'æ'],
        ],
    },
} as const satisfies Record<string, SubstitutionDefinition>;

const subInfo: SubstitutionInfo = {
    substitutionDefinitions: [
        subDefs['html-symbol-entities'],
        subDefs['unicode-escapes'],
        makeSubDef('html-symbol-entities-rev', reverse(mapHtmlEntities())),
        makeSubDef('unicode-accents', mapUnicodeAccents()),
        makeSubDef('uri-escapes', uriEscapes()),
        makeSubDef('unicode-accents-rev', reverse(mapUnicodeAccents())),
        makeSubDef('uri-escapes-rev', reverse(uriEscapes())),
    ],
};

function makeTransformer(subs: SubstitutionInfo['substitutions'] | string, info: SubstitutionInfo = subInfo) {
    const substitutions = typeof subs === 'string' ? [subs] : subs;
    const r = createSubstitutionTransformer({ ...info, substitutions });
    assert(!r.missing);
    return r.transformer;
}

function tm(text: string, range: [number, number], map?: number[]): MappedText {
    return map ? { text, range, map } : { text, range };
}

function makeSubDef(name: string, entries: Iterable<[string, string]>): SubstitutionDefinition {
    return { name, entries: [...entries] };
}

function* reverse(entries: Iterable<[string, string]>): Iterable<[string, string]> {
    for (const [from, to] of entries) {
        yield [to, from];
    }
}

function mapUnicodeAccents(): Map<string, string> {
    let sample = 'aeiouîéüèñ'; // cspell:disable-line
    sample = (sample + sample.toUpperCase()).normalize('NFC');
    const accents = sample.normalize('NFD').replaceAll(/[^\p{M}]/gu, '');
    const letters = sample.normalize('NFD').replaceAll(/\p{M}/gu, '');

    const map = new Map<string, string>();

    for (const letter of letters) {
        for (const accent of accents) {
            const from = letter + accent;
            const accented = from.normalize('NFC');
            if (accented !== from) {
                map.set(from, accented);
            }
        }
    }

    return map;
}

function mapHtmlEntities(): Map<string, string> {
    const map = new Map<string, string>([
        ['&#39;', "'"],
        ['&#768;', String.fromCodePoint(768)],
        ['&#769;', String.fromCodePoint(769)],
        ['&#770;', String.fromCodePoint(770)],
        ['&#771;', String.fromCodePoint(771)],
        ['e&#769;', 'é'],
    ]);

    const moreChars = [...mapUnicodeAccents().values(), ...'!@#$%^&*()-_=+}{[]"\':;<>,.?/|\\'];
    for (const char of moreChars) {
        const esc = `&#${char.codePointAt(0)};`;
        map.set(esc, char);
    }

    map.set('&apos;', "'");

    return map;
}

function uriEscapes(): Map<string, string> {
    const map = new Map<string, string>();
    for (let i = 0; i < 256; i++) {
        const char = String.fromCodePoint(i);
        const esc = encodeURIComponent(char);
        if (esc !== char) {
            map.set(esc, char);
        }
    }
    const moreChars = [...mapUnicodeAccents().entries(), ...'!@#$%^&*()-_=+}{[]"\':;<>,.?/|\\'].flat();
    for (const char of moreChars) {
        const esc = encodeURIComponent(char);
        if (esc !== char) {
            map.set(esc, char);
        }
    }
    return map;
}
