import type { ParsedText } from '@cspell/cspell-types';
import type { SpellingDictionary } from 'cspell-dictionary';
import { createCollection, createSpellingDictionary, createSuggestDictionary } from 'cspell-dictionary';
import { describe, expect, test } from 'vitest';

import type { SubstitutionInfo } from '../Transform/index.js';
import { createSubstitutionTransformer } from '../Transform/index.js';
import { mapRangeBackToOriginalPos } from '../Transform/parsedText.js';
import { softHyphen } from '../Transform/Transformer.js';
import { textValidatorFactory } from './lineValidatorFactory.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('lineValidatorFactory', () => {
    // cspell:ignore 𐀀𐃘 izfrNTmQLnfsLzi2Wb9x izfr Lnfs Drived xxfour

    test.each`
        text                                              | expected
        ${'one'}                                          | ${[]}
        ${'three etc.'}                                   | ${[]}
        ${'three etc. 𐀀𐃘'}                                | ${[]}
        ${'three etc. izfrNTmQLnfsLzi2Wb9x'}              | ${[]}
        ${'1LogRecord_1a46bc9a3adab542be80be9671d2ff82e'} | ${[]}
        ${'To_EntityDto_And_To_DrivedEntityDto'}          | ${[oc({ text: 'Drived' })]}
        ${'three etc. izfrNTmQLnfsLzi2Wb9'}               | ${[oc({ text: 'izfr' }), oc({ text: 'Lnfs' }), oc({ text: 'Lzi' })]}
        ${'flip-flop'}                                    | ${[oc({ text: 'flip-flop', isFlagged: true })]}
        ${'one flip-flop.'}                               | ${[oc({ text: 'flip-flop', isFlagged: true })]}
        ${'one two three etc'}                            | ${[oc({ text: 'etc' })]}
        ${'three four five one'}                          | ${[oc({ text: 'five' })]}
        ${'lion'}                                         | ${[oc({ text: 'lion', suggestionsEx: [oc({ word: 'tiger', isPreferred: true })] })]}
        ${'one_q\u00ADz_xxfour'}                          | ${[oc({ text: 'xxfour' })]}
        ${'one_A\u00ADBs_xxfour'}                         | ${[oc({ text: 'xxfour' })]}
        ${'one_ABi\u00ADng_xxfour'}                       | ${[oc({ text: 'xxfour' })]}
    `('textValidatorFactory $text', ({ text, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, {
            ignoreCase: true,
            minWordLength: 3,
            minRandomLength: 20,
            transformer: undefined,
        });
        const r = [...tv.validate({ text: text, range: [10, 10 + text.length] })];
        expect(r).toEqual(expected);
    });

    // cspell:ignore adab AFDA eefcb opclasses charmodel relationmodel deadfee

    test.each`
        text                                                              | expected
        ${'three etc. izfrNTmQLnfsLzi2Wb9x'}                              | ${[]}
        ${'1LogRecord_1a46bc9a3adab542be80be9671d2ff82e'}                 | ${[]}
        ${'NS_CONST_VERSION_253D4AFDA959234B48A478B956C3C'}               | ${[]}
        ${'PowerShell.Management_eefcb906-b326-4e99-9f54-8b'}             | ${[]}
        ${'To_EntityDto_And_To_DrivedEntityDto'}                          | ${['Drived']}
        ${'constraint_opclasses("schema_charmodel_field_8b338dea_like")'} | ${['opclasses', 'charmodel']}
        ${'constraint_opclasses("schema_charmodel_field_8deadfee_like")'} | ${['opclasses', 'charmodel', 'deadfee']}
        ${'self.assertIn("schema_relationmodel_field_id_395fbb08_like")'} | ${['relationmodel']}
    `('textValidatorFactory $text', ({ text, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, {
            ignoreCase: true,
            minWordLength: 3,
            minRandomLength: 20,
            transformer: undefined,
        });
        const r = [...tv.validate({ text: text, range: [10, 10 + text.length] })].map((a) => a.text);
        expect(r).toEqual(expected);
    });
});

describe('lineValidatorFactory with transformer', () => {
    // cspell:ignore aint apos couldn
    const { transformer } = createSubstitutionTransformer({
        substitutionDefinitions: [],
        substitutions: [
            ['&shy;', ''],
            ["\\'", "'"],
        ],
    });

    test('transformer should replace &shy; and escaped single quote', () => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, {
            ignoreCase: true,
            minWordLength: 3,
            minRandomLength: 20,
            transformer,
        });
        const text = "This is a test constr&shy;aint that string does\\'nt have an issue with single quote.";
        const transformed = { text: text, range: [0, text.length] } as const;
        const r = [...tv.validate(transformed)];
        const rWords = r.map((a) => a.text);
        const rSrcText = r.map((a) => extractRange(transformed, a.range));
        expect(rWords).toEqual([
            'This',
            'test',
            'that',
            'string',
            "does'nt",
            'have',
            'issue',
            'with',
            'single',
            'quote',
        ]);
        expect(rSrcText).toEqual([
            'This',
            'test',
            'that',
            'string',
            "does\\'nt",
            'have',
            'issue',
            'with',
            'single',
            'quote',
        ]);
    });

    test('pre-transformed text', () => {
        const substitutionDefinitions: SubstitutionInfo['substitutionDefinitions'] = [
            {
                name: 'html-symbol-entities',
                entries: [
                    ['    ', ''],
                    ['&apos;', "'"],
                    ['e&#769;', 'é'],
                    ['&shy;', softHyphen],
                ],
            },
            {
                name: 'escapes',
                entries: [["\\'", "'"]],
            },
        ];

        const { transformer: transformerShy } = createSubstitutionTransformer({
            substitutions: ['html-symbol-entities'],
            substitutionDefinitions,
        });

        const { transformer: transformerEscape } = createSubstitutionTransformer({
            substitutions: ['escapes'],
            substitutionDefinitions,
        });

        const dict = getDict();
        const srcText =
            "    This is a test constr&shy;aint a break&shy;point  that  string does\\'nt couldn&apos;t have an issue with single quote.";
        const transformed = transformerShy.transform(srcText);
        const tv = textValidatorFactory(dict, {
            ignoreCase: true,
            minWordLength: 3,
            minRandomLength: 20,
            transformer: transformerEscape,
        });
        const r = [...tv.validate(transformed)];
        const rWords = r.map((a) => a.text);
        const rSrcText = r.map((a) => extractRange(transformed, a.range));
        expect(rWords).toEqual([
            'This',
            'test',
            'break',
            'point',
            'that',
            'string',
            "does'nt",
            "couldn't",
            'have',
            'issue',
            'with',
            'single',
            'quote',
        ]);
        expect(rSrcText).toEqual([
            'This',
            'test',
            'break',
            'point',
            'that',
            'string',
            "does\\'nt",
            'couldn&apos;t',
            'have',
            'issue',
            'with',
            'single',
            'quote',
        ]);
    });
});

let dict: SpellingDictionary | undefined;

function extractRange(transformed: ParsedText, range: readonly [number, number]) {
    const [start, end] = mapRangeBackToOriginalPos(range, undefined);

    const rawText = transformed.rawText ?? transformed.text;
    return rawText.slice(start, end);
}

function getDict(): SpellingDictionary {
    if (dict) return dict;
    const words = `
        one two three four etc. a.b.c !flip-flop
        To EntityDto And
        PowerShell Management
        CONST VERSION
        LogRecord
        constraint schema field like
        self assert
        !deadfee
    `
        .split(/\s+/)
        .filter((a) => !!a);
    const suggestions = 'apple:pear lion:tiger'.split(' ');
    const d = createCollection(
        [
            createSpellingDictionary(words, 'words', 'tests'),
            createSuggestDictionary(suggestions, 'suggestions', 'test'),
        ],
        'collection',
        'tests',
    );
    dict = d;
    return d;
}
