import assert from 'node:assert';

import { describe, expect, test, vi } from 'vitest';

import { CSpellConfigFileJson } from '../CSpellConfigFile/CSpellConfigFileJson.js';
import { defaultNextDeserializer, defaultNextSerializer } from '../defaultNext.js';
import { json } from '../test-helpers/util.js';
import { unindent } from '../util/unindent.js';
import { serializerCSpellJson } from './cspellJson.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

const next = defaultNextDeserializer;

describe('cspellJson', () => {
    const sampleCSpellJson = unindent`\
        {
            "version": "0.2",
            // Add words here:
            "words": [
                // before
                "cache", // Inline comment
                "unsubscribe" // last
            ]
        }
    `;

    test.each`
        uri                  | content                                    | expected
        ${'cspell.json'}     | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'cspell-ext.json'} | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'.cspell.json'}    | ${'{\n  // add words here\n  "words":[]}'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(serializerCSpellJson.deserialize({ url: new URL(uri, 'file:///'), content }, next)).toEqual(expected);
    });

    test.each`
        uri              | content | expected
        ${''}            | ${''}   | ${'Unable to parse config file: "file:///"'}
        ${'cspell.js'}   | ${''}   | ${'Unable to parse config file: "file:///cspell.js"'}
        ${'cspell.yaml'} | ${''}   | ${'Unable to parse config file: "file:///cspell.yaml"'}
        ${'cspell.json'} | ${''}   | ${'Unable to parse file:///cspell.json'}
        ${'cspell.json'} | ${'[]'} | ${'Unable to parse file:///cspell.json'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => serializerCSpellJson.deserialize({ url: new URL(uri, 'file:///'), content }, next)).toThrow(
            expected,
        );
    });

    test.each`
        uri                  | content                   | expected
        ${'cspell.json'}     | ${'{\n\t"name": "name"}'} | ${json({ name: 'name' }, '\t')}
        ${'cspell.json?x=5'} | ${'{\n  "words":[]}'}     | ${json({ words: [] }, 2)}
        ${'cspell.jsonc'}    | ${sampleCSpellJson}       | ${sampleCSpellJson}
    `('serialize $uri', ({ uri, content, expected }) => {
        const next = vi.fn();
        const file = serializerCSpellJson.deserialize({ url: new URL(uri, 'file:///'), content }, next);
        assert(file instanceof CSpellConfigFileJson);
        expect(serializerCSpellJson.serialize(file, defaultNextSerializer)).toEqual(expected);
        expect(next).toHaveBeenCalledTimes(0);
    });

    test('serialize reject', () => {
        const next = vi.fn();
        serializerCSpellJson.serialize({ url: new URL('file:///file.txt'), settings: {} }, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('add words', () => {
        const next = vi.fn();
        const file = serializerCSpellJson.deserialize(
            { url: new URL('cspell.json', import.meta.url), content: sampleCSpellJson },
            next,
        );

        expect(serializerCSpellJson.serialize(file, defaultNextSerializer)).toEqual(sampleCSpellJson);

        file.addWords(['fig', 'cache', 'carrot', 'broccoli', 'fig']);
        expect(serializerCSpellJson.serialize(file, defaultNextSerializer)).toEqual(unindent`\
            {
                "version": "0.2",
                // Add words here:
                "words": [
                    "broccoli",
                    // before
                    "cache", // Inline comment
                    "carrot",
                    "fig",
                    "unsubscribe" // last
                ]
            }
        `);
    });
});
