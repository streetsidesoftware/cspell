import { describe, expect, test } from 'vitest';

import type { SubstitutionInfo } from './SubstitutionTransformer.js';
import { createSubstitutionTransformer, SubstitutionTransformer } from './SubstitutionTransformer.js';

// cspell:dictionary html-symbol-entities

describe('SubstitutionTransformer', () => {
    const info: SubstitutionInfo = {
        substitutions: ['html-symbol-entities', 'unicode-escapes', ["\\'", "'"]],
        substitutionDefinitions: [
            {
                name: 'html-symbol-entities',
                entries: [
                    ['&apos;', "'"],
                    ['&#39;', "'"],
                    ['&#768;', String.fromCodePoint(768)],
                    ['&#769;', String.fromCodePoint(769)],
                    ['&#770;', String.fromCodePoint(770)],
                    ['&#771;', String.fromCodePoint(771)],
                    ['e&#769;', 'é'],
                ],
            },
            {
                name: 'unicode-escapes',
                entries: [
                    ['\\u00e9', 'é'],
                    ['\\u00f8', 'ø'],
                    ['\\u00e6', 'æ'],
                ],
            },
        ],
    };

    test('createSubstitutionTransformer', () => {
        const { transformer, missing } = createSubstitutionTransformer(info);
        expect(transformer).toBeInstanceOf(SubstitutionTransformer);
        expect(missing).toBeUndefined();
    });

    test('createSubstitutionTransformer with missing', () => {
        const infoWithMissing: SubstitutionInfo = {
            ...info,
            substitutions: [...(info.substitutions || []), 'missing-substitution'],
        };
        const { transformer, missing } = createSubstitutionTransformer(infoWithMissing);
        expect(transformer).toBeInstanceOf(SubstitutionTransformer);
        expect(missing).toEqual(['missing-substitution']);
    });

    test.each`
        input                                | expectedText                 | expectedMap
        ${'&apos;'}                          | ${"'"}                       | ${[0, 0, 6, 1]}
        ${'&apos;s'}                         | ${"'s"}                      | ${[0, 0, 6, 1, 7, 2]}
        ${'&#39;'}                           | ${"'"}                       | ${[0, 0, 5, 1]}
        ${'&#768;'}                          | ${String.fromCodePoint(768)} | ${[0, 0, 6, 1]}
        ${'e&#769;'}                         | ${'é'}                       | ${[0, 0, 7, 1]}
        ${'e&#768;'}                         | ${'è'.normalize('NFD')}      | ${[0, 0, 1, 1, 7, 2]}
        ${'Grand Caf\\u00e9 Bj\\u00f8rvika'} | ${'Grand Café Bjørvika'}     | ${[0, 0, 9, 9, 15, 10, 18, 13, 24, 14, 29, 19]}
        ${'Don&apos;t, shouldn&#39;t'}       | ${"Don't, shouldn't"}        | ${[0, 0, 3, 3, 9, 4, 19, 14, 24, 15, 25, 16]}
    `('transformText - $input', ({ input, expectedText, expectedMap }) => {
        const { transformer } = createSubstitutionTransformer(info);
        const result = transformer.transform(input);
        expect(result.text).toBe(expectedText);
        expect(result.map).toEqual(expectedMap);
        expect(result.range).toEqual([0, input.length]);
    });
});

// cspell:ignore Bjørvika rvika shouldn
