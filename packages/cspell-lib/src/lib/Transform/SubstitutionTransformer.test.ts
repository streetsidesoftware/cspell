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
        ${'&apos;'}                          | ${"'"}                       | ${[6, 1]}
        ${'&apos;s'}                         | ${"'s"}                      | ${[6, 1, 1, 1]}
        ${'&#39;'}                           | ${"'"}                       | ${[5, 1]}
        ${'&#768;'}                          | ${String.fromCodePoint(768)} | ${[6, 1]}
        ${'e&#769;'}                         | ${'é'}                       | ${[7, 1]}
        ${'e&#768;'}                         | ${'è'.normalize('NFD')}      | ${[1, 1, 6, 1]}
        ${'Grand Caf\\u00e9 Bj\\u00f8rvika'} | ${'Grand Café Bjørvika'}     | ${[9, 9, 6, 1, 3, 3, 6, 1, 5, 5]}
        ${'Don&apos;t, shouldn&#39;t'}       | ${"Don't, shouldn't"}        | ${[3, 3, 6, 1, 10, 10, 5, 1, 1, 1]}
    `('transformText - $input', ({ input, expectedText, expectedMap }) => {
        const { transformer } = createSubstitutionTransformer(info);
        const result = transformer.transform(input);
        expect(result.text).toBe(expectedText);
        expect(result.map).toEqual(expectedMap);
        expect(result.range).toEqual([0, input.length]);
    });
});

// cspell:ignore Bjørvika rvika shouldn
