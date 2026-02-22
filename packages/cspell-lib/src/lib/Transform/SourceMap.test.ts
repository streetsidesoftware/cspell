import assert from 'node:assert';

import type { MappedText, SubstitutionDefinition } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { mergeSourceMaps, sliceSourceMapToSourceRange } from './SourceMap.js';
import type { SubstitutionInfo } from './SubstitutionTransformer.js';
import { createSubstitutionTransformer } from './SubstitutionTransformer.js';
import { calculateRangeInDest, calculateRangeInSrc } from './TextMap.js';

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
        ${[3, 3, 4, 1]} | ${[5, 5]}       | ${[3, 3, 4, 1, 1, 1]}
        ${[3, 3, 4, 1]} | ${[0, 0, 5, 5]} | ${[8, 5]}
        ${[]}           | ${[0, 0, 3, 3]} | ${[0, 0, 3, 3]}
        ${[0, 0, 8, 8]} | ${[0, 0, 3, 3]} | ${[0, 0, 8, 8]}
    `('mergeSourceMaps $map1, $map2', ({ map1, map2, expected }) => {
        const r = mergeSourceMaps(map1, map2);
        expect(r).toEqual(expected);
    });

    test.each`
        text                            | sub1             | sub2                      | expectedText          | expectedMap
        ${'café'}                       | ${'identity'}    | ${'identity'}             | ${'café'}             | ${undefined}
        ${'caf%C3%A9'}                  | ${'uri-escapes'} | ${'identity'}             | ${'café'}             | ${[3, 3, 6, 1]}
        ${'caf%26%23233%3B%26apos%3Bs'} | ${'uri-escapes'} | ${'identity'}             | ${'caf&#233;&apos;s'} | ${[3, 3, 3, 1, 3, 1, 3, 3, 3, 1, 3, 1, 4, 4, 3, 1, 1, 1]}
        ${'caf%26%23233%3B%26apos%3Bs'} | ${'uri-escapes'} | ${'html-symbol-entities'} | ${"café's"}           | ${[3, 3, 12, 1, 10, 1, 1, 1]}
    `('mergeSourceMaps substitutions  $text, $sub1, $sub2', ({ text, sub1, sub2, expectedText, expectedMap }) => {
        const t1 = makeTransformer(sub1);
        const t2 = makeTransformer(sub2);
        const tText1 = t1.transform(text);
        const tText2 = t2.transform(tText1.text);
        expect(tText2.text).toEqual(expectedText);
        const r = mergeSourceMaps(tText1.map, tText2.map);
        expect(r).toEqual(expectedMap);
    });

    test.each`
        text                            | range                      | expectedText | expectedSeg
        ${'café'}                       | ${[0, 'café'.length]}      | ${'café'}    | ${'café'}
        ${'caf%C3%A9'}                  | ${[0, 'caf%C3%A9'.length]} | ${'café'}    | ${'café'}
        ${'caf%26%23233%3B%26apos%3Bs'} | ${undefined}               | ${"café's"}  | ${"café's"}
        ${'caf%C3%A9'}                  | ${[3, 9]}                  | ${'café'}    | ${'é'}
    `('mergeSourceMaps range from origin  $text, $range in source', ({ text, range, expectedText, expectedSeg }) => {
        range ??= [0, text.length];
        const t1 = makeTransformer('uri-escapes');
        const t2 = makeTransformer('html-symbol-entities');
        const tText1 = t1.transform(text);
        const tText2 = t2.transform(tText1.text);
        expect(tText2.text).toEqual(expectedText);
        const srcMap = mergeSourceMaps(tText1.map, tText2.map);
        const r = calculateRangeInDest(srcMap, range);
        expect(tText2.text.slice(r[0], r[1])).toEqual(expectedSeg);
        const rSrc = calculateRangeInSrc(srcMap, r);
        expect(rSrc).toEqual(range);
    });
});

describe('sliceSourceMapToSourceRange', () => {
    const t0 = 'caf%26%23233%3B%26apos%3Bs';
    const tm0 = decodeUri(t0);

    test('assumptions', () => {
        expect(tm0.text).toEqual("café's");
        expect(tm0.text.slice(...calculateRangeInDest(tm0.map, [0, t0.length]))).toEqual(tm0.text);
        expect(tm0.text.slice(...calculateRangeInDest(tm0.map, [0, 15]))).toEqual('café');
    });

    test.each`
        map                                     | extRange      | expected
        ${[]}                                   | ${[200, 219]} | ${[]}
        ${tm0.map}                              | ${tm0.range}  | ${tm0.map}
        ${[3, 3, 3, 0, 3, 0, 3, 0, 3, 0, 0, 1]} | ${[0, 26]}    | ${[3, 3, 3, 0, 3, 0, 3, 0, 3, 0, 0, 1]}
        ${[3, 3, 3, 0, 3, 0, 3, 0, 3, 0, 0, 1]} | ${[0, 15]}    | ${[3, 3, 3, 0, 3, 0, 3, 0, 3, 0, 0, 1]}
    `('sliceSourceMapToSourceRange $map, $extRange', ({ map, extRange, expected }) => {
        const r = sliceSourceMapToSourceRange(map, extRange);
        expect(r).toEqual(expected);
    });

    function decodeUri(text: string): MappedText {
        const range = [0, text.length] as const;
        const t1 = makeTransformer('uri-escapes');
        const t2 = makeTransformer('html-symbol-entities');
        const tText1 = t1.transform(text);
        const tText2 = t2.transform(tText1.text);
        const srcMap = mergeSourceMaps(tText1.map, tText2.map);
        return { text: tText2.text, range, map: srcMap };
    }
});

describe('Substitution Assumptions', () => {
    const tFromUri = makeTransformer('uri-escapes');
    const tToUri = makeTransformer('uri-escapes-rev');
    const tFromHtml = makeTransformer('html-symbol-entities');
    const tToHtml = makeTransformer('html-symbol-entities-rev');

    test('assumptions', () => {
        expect(tFromUri.transform('caf%C3%A9')).toEqual(tm('café', [0, 9], [3, 3, 6, 1]));
        expect(tToUri.transform("café's")).toEqual(tm("caf%C3%A9's", [0, 6], [3, 3, 1, 6, 2, 2]));
        expect(tFromHtml.transform('caf&#233;')).toEqual(tm('café', [0, 9], [3, 3, 6, 1]));
        expect(tToHtml.transform("café's")).toEqual(tm('caf&#233;&apos;s', [0, 6], [3, 3, 1, 6, 1, 6, 1, 1]));

        expect(tToHtml.transform("café's $")).toEqual(
            tm('caf&#233;&apos;s &#36;', [0, 8], [3, 3, 1, 6, 1, 6, 2, 2, 1, 5]),
        );

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
        makeSubDef('identity', []),
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
