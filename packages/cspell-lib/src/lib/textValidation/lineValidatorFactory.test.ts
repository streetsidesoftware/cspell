import type { SpellingDictionary } from 'cspell-dictionary';
import { createCollection, createSpellingDictionary, createSuggestDictionary } from 'cspell-dictionary';
import { describe, expect, test } from 'vitest';

import { textValidatorFactory } from './lineValidatorFactory.js';

const oc = <T>(obj: T) => expect.objectContaining(obj);

describe('lineValidatorFactory', () => {
    // cspell:ignore 𐀀𐃘 izfrNTmQLnfsLzi2Wb9x izfr Lnfs Drived

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
    `('textValidatorFactory $text', ({ text, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, { ignoreCase: true, minWordLength: 3, minRandomLength: 20 });
        const r = [...tv.validate({ text: text, range: [10, 10 + text.length] })];
        expect(r).toEqual(expected);
    });

    // cspell:ignore adab AFDA eefcb opclasses charmodel relationmodel

    test.each`
        text                                                              | expected
        ${'three etc. izfrNTmQLnfsLzi2Wb9x'}                              | ${[]}
        ${'1LogRecord_1a46bc9a3adab542be80be9671d2ff82e'}                 | ${[]}
        ${'NS_CONST_VERSION_253D4AFDA959234B48A478B956C3C'}               | ${[]}
        ${'PowerShell.Management_eefcb906-b326-4e99-9f54-8b'}             | ${[]}
        ${'To_EntityDto_And_To_DrivedEntityDto'}                          | ${['Drived']}
        ${'constraint_opclasses("schema_charmodel_field_8b338dea_like")'} | ${['opclasses', 'charmodel']}
        ${'self.assertIn("schema_relationmodel_field_id_395fbb08_like")'} | ${['relationmodel']}
    `('textValidatorFactory $text', ({ text, expected }) => {
        const dict = getDict();
        const tv = textValidatorFactory(dict, { ignoreCase: true, minWordLength: 3, minRandomLength: 20 });
        const r = [...tv.validate({ text: text, range: [10, 10 + text.length] })].map((a) => a.text);
        expect(r).toEqual(expected);
    });
});

let dict: SpellingDictionary | undefined;

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
