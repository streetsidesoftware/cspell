import assert from 'node:assert';

import { stringify as toml } from 'smol-toml';
import { describe, expect, test, vi } from 'vitest';

import { CSpellConfigFileToml } from '../CSpellConfigFile/CSpellConfigFileToml.js';
import { defaultNextDeserializer, defaultNextSerializer } from '../defaultNext.js';
import { unindent } from '../util/unindent.js';
import { serializerCSpellToml } from './cspellToml.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

const next = defaultNextDeserializer;

describe('cspellToml', () => {
    const sampleCSpellToml = unindent`\
        version = "0.2"
        words = [ "cache", "unsubscribe" ]
    `;

    test.each`
        uri                  | content         | expected
        ${'cspell.toml'}     | ${'words = []'} | ${oc({ settings: { words: [] } })}
        ${'cspell-ext.toml'} | ${'words = []'} | ${oc({ settings: { words: [] } })}
        ${'.cspell.toml'}    | ${'words = []'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(serializerCSpellToml.deserialize({ url: new URL(uri, 'file:///'), content }, next)).toEqual(expected);
    });

    test.each`
        uri              | content | expected
        ${''}            | ${''}   | ${'Unable to parse config file: "file:///"'}
        ${'cspell.js'}   | ${''}   | ${'Unable to parse config file: "file:///cspell.js"'}
        ${'cspell.yaml'} | ${''}   | ${'Unable to parse config file: "file:///cspell.yaml"'}
        ${'cspell.toml'} | ${'{}'} | ${'Unable to parse file:///cspell.toml'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => serializerCSpellToml.deserialize({ url: new URL(uri, 'file:///'), content }, next)).toThrow(
            expected,
        );
    });

    test.each`
        uri                  | content              | expected
        ${'cspell.toml'}     | ${'\nname = "name"'} | ${toml({ name: 'name' })}
        ${'cspell.toml?x=5'} | ${'words = []'}      | ${toml({ words: [] })}
    `('serialize $uri', ({ uri, content, expected }) => {
        const next = vi.fn();
        const file = serializerCSpellToml.deserialize({ url: new URL(uri, import.meta.url), content }, next);
        assert(file instanceof CSpellConfigFileToml);
        const result = serializerCSpellToml.serialize(file, defaultNextSerializer);
        expect(result.endsWith('\n')).toBe(true);
        expect(result).toEqual(expected);
        expect(next).toHaveBeenCalledTimes(0);
    });

    test('serialize reject', () => {
        const next = vi.fn();
        serializerCSpellToml.serialize({ url: new URL('file:///file.txt'), settings: {} }, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('add words', () => {
        const next = vi.fn();
        const file = serializerCSpellToml.deserialize(
            { url: new URL('cspell.Toml', import.meta.url), content: sampleCSpellToml },
            next,
        );

        expect((serializerCSpellToml.serialize(file, defaultNextSerializer))).toEqual(sampleCSpellToml);

        file.addWords(['fig', 'cache', 'carrot', 'broccoli', 'fig']);
        expect((serializerCSpellToml.serialize(file, defaultNextSerializer))).toEqual(
            unindent`\
            version = "0.2"
            words = [ "broccoli", "cache", "carrot", "fig", "unsubscribe" ]
        `,
        );
    });
});
