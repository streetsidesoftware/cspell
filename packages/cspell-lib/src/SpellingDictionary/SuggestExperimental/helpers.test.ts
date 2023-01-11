import * as helpers from './helpers';
import type { SuggestionResult, Feature } from './entities';
import { FeatureMap } from './helpers';

describe('Validate Suggest Helpers', () => {
    test('compareResult', () => {
        const sr: SuggestionResult[] = [
            { word: 'cone', score: 0.6 },
            { word: 'apple', score: 0.3 },
            { word: 'pear', score: 0.3 },
            { word: 'banana', score: 0.6 },
        ];

        const r = sr.concat([]).sort(helpers.compareResults);
        expect(r).toEqual([sr[3], sr[0], sr[1], sr[2]]);
    });

    test('wordToSingleLetterFeatures', () => {
        const tests = [
            { v: '', e: [] },
            { v: 'a', e: [['a', 1]] },
            {
                v: 'hello',
                e: [
                    ['h', 1],
                    ['e', 1],
                    ['l', 1],
                    ['l', 1],
                    ['o', 1],
                ],
            },
        ];

        tests.forEach((t) => {
            expect(helpers.wordToSingleLetterFeatures(t.v)).toEqual(t.e);
        });
    });

    test('mergeFeatures', () => {
        const tests = [
            { v: '', e: [] },
            { v: 'a', e: [['a', 1]] },
            {
                v: 'hello ole',
                e: [
                    ['h', 1],
                    ['e', 2],
                    ['l', 3],
                    ['o', 2],
                    [' ', 1],
                ],
            },
        ];

        tests.forEach((t) => {
            const map = new FeatureMap();
            helpers.mergeFeatures(map, helpers.wordToSingleLetterFeatures(t.v));
            expect([...map]).toEqual(t.e);
            expect(map.count).toBe(t.e.map((kvp) => kvp[1] as number).reduce((a, b) => a + b, 0));
        });
    });

    test('wordToTwoLetterFeatures', () => {
        const tests = [
            { v: '', e: [] },
            {
                v: '^a$',
                e: [
                    ['^a', 1],
                    ['a$', 1],
                ],
            },
            {
                v: '^move$',
                e: [
                    ['^m', 1],
                    ['mo', 1],
                    ['ov', 1],
                    ['ve', 1],
                    ['e$', 1],
                ],
            },
        ];

        tests.forEach((t) => {
            expect(helpers.wordToTwoLetterFeatures(t.v)).toEqual(t.e);
        });
    });

    // cspell:ignore ello
    test('segmentString', () => {
        const tests = [
            { v: 'a', s: 1, e: 'a'.split('') },
            { v: 'hello', s: 1, e: 'hello'.split('') },
            { v: 'hello', s: 2, e: ['he', 'el', 'll', 'lo'] },
            { v: 'hello', s: 3, e: ['hel', 'ell', 'llo'] },
            { v: 'hello', s: 4, e: ['hell', 'ello'] },
            { v: 'hello', s: 5, e: ['hello'] },
            { v: 'hello', s: 6, e: [] },
            { v: 'hello', s: 7, e: [] },
        ];

        tests.forEach((t) => {
            expect(helpers.segmentString(t.v, t.s)).toEqual(t.e);
        });
    });

    test('wordToFeatures', () => {
        const comp = (a: Feature, b: Feature) => a[0].localeCompare(b[0]);
        const features = helpers.wordToFeatures('^hello$');
        expect([...features].sort(comp)).toEqual(
            [
                ['h', 1],
                ['e', 1],
                ['l', 2],
                ['o', 1],
                ['^', 1],
                ['$', 1],
                ['^h', 1],
                ['he', 1],
                ['el', 1],
                ['ll', 1],
                ['lo', 1],
                ['o$', 1],
            ].sort(comp)
        );
    });

    test('intersectionScore', () => {
        const fA = helpers.wordToFeatures('^hello$');
        const fB = helpers.wordToFeatures('^goodbye$');
        expect(fA.intersectionScore(fA)).toBe(fA.count);
        expect(fB.intersectionScore(fB)).toBe(fB.count);
        expect(fA.intersectionScore(fB)).toBe(fB.intersectionScore(fA));
        expect(fA.intersectionScore(fB)).toBe(4);
    });

    test('correlationScore', () => {
        const fA = helpers.wordToFeatures('^hello$');
        const fB = helpers.wordToFeatures('^goodbye$');
        expect(fA.correlationScore(fA)).toBe(1);
        expect(fB.correlationScore(fB)).toBe(1);
        expect(fA.correlationScore(fB)).toBe(fB.correlationScore(fA));
        expect(fA.correlationScore(fB)).toBe(4 / (fA.count + fB.count - 4));
    });
});
