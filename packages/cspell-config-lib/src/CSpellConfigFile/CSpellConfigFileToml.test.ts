import { parse } from 'smol-toml';
import { describe, expect, test } from 'vitest';

import { cspellConfigFileSchema } from '../CSpellConfigFile.js';
import { createTextFile } from '../TextFile.js';
import { unindent } from '../util/unindent.js';
import { CSpellConfigFileToml } from './CSpellConfigFileToml.js';

describe('CSpellConfigFileToml', () => {
    const url = new URL('https://example.com/config.toml');
    const settings = {
        language: 'en',
        ignoreWords: ['foo', 'bar'],
    };

    test('should serialize the settings to Toml', () => {
        const configFile = new CSpellConfigFileToml(url, settings);
        const serialized = configFile.serialize();
        expect(parse(serialized)).toEqual(settings);
    });

    test('should parse a TOML file into CSpellConfigFileJson object', () => {
        const toml = unindent`\
            # This is a comment
            language = "en"
            ignoreWords = ["foo", "bar"]
        `;
        const file = createTextFile(url, toml);
        const configFile = CSpellConfigFileToml.parse(file);
        expect(configFile.url).toEqual(url);
        expect(configFile.settings).toEqual(settings);

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            language = "en"
            ignoreWords = [ "foo", "bar" ]
        `);
    });

    test('set schema', () => {
        const toml = unindent`\
            language = "en"
            ignoreWords = ["foo", "bar"]
        `;
        const file = createTextFile(url, toml);
        const configFile = CSpellConfigFileToml.parse(file);

        configFile.setSchema(cspellConfigFileSchema);

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            language = "en"
            ignoreWords = [ "foo", "bar" ]
            "$schema" = "${cspellConfigFileSchema}"
        `);
    });

    test('setComment not implemented', () => {
        const toml = unindent`\
            language = "en"
            ignoreWords = ["foo", "bar"]
        `;
        const file = createTextFile(url, toml);
        const configFile = CSpellConfigFileToml.parse(file);

        configFile.setComment('language', ' After "language"', true);
        configFile.setComment('language', ' Language is important');

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            language = "en"
            ignoreWords = [ "foo", "bar" ]
        `);
    });

    test('should throw an error when parsing an invalid Toml file', () => {
        const json = `{
            "language": "en",
            "ignoreWords": ["foo", "bar"
        }`;
        const file = createTextFile(url, json);
        expect(() => CSpellConfigFileToml.parse(file)).toThrowError();
    });
});
