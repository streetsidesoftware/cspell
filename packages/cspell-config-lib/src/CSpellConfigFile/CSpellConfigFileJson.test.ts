import { describe, expect, test } from 'vitest';

import { cspellConfigFileSchema } from '../CSpellConfigFile.js';
import { createTextFile } from '../TextFile.js';
import { unindent } from '../util/unindent.js';
import { CSpellConfigFileJson, parseCSpellConfigFileJson } from './CSpellConfigFileJson.js';

describe('CSpellConfigFileJson', () => {
    const url = new URL('https://example.com/config.json');
    const settings = {
        language: 'en',
        ignoreWords: ['foo', 'bar'],
    };

    test('should serialize the settings to JSON', () => {
        const configFile = new CSpellConfigFileJson(url, settings);
        const serialized = configFile.serialize();
        expect(JSON.parse(serialized)).toEqual(settings);
    });

    test('should serialize and preserve indent', () => {
        const content = JSON.stringify(settings, undefined, '\t') + '\n';
        const configFile = CSpellConfigFileJson.parse({ url, content });
        const serialized = configFile.serialize();
        expect(serialized).toEqual(content);
    });

    test('should parse a JSON file into CSpellConfigFileJson object', () => {
        const json = `{
            // This is a comment
            "language": "en",
            "ignoreWords": ["foo", "bar"]
        }`;
        const file = createTextFile(url, json);
        const configFile = CSpellConfigFileJson.parse(file);
        expect(configFile.url).toEqual(url);
        expect(configFile.settings).toEqual(settings);

        const serialized = configFile.serialize();
        expect(serialized).toEqual(expect.stringContaining('// This is a comment'));
    });

    test('remove all comments', () => {
        const json = unindent`\
            {
                // This is a comment
                "language": "en", // Another comment
                "ignoreWords": ["foo", "bar"]
            }
        `;
        const file = createTextFile(url, json);
        const configFile = CSpellConfigFileJson.parse(file);

        configFile.removeAllComments();

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            {
                "language": "en",
                "ignoreWords": [
                    "foo",
                    "bar"
                ]
            }
        `);
    });

    test('set schema', () => {
        const json = unindent`\
            {
                // This is a comment
                "language": "en", // Another comment
                "ignoreWords": ["foo", "bar"]
            }
        `;
        const file = createTextFile(url, json);
        const configFile = CSpellConfigFileJson.parse(file);

        configFile.setSchema(cspellConfigFileSchema);

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            {
                // This is a comment
                "language": "en", // Another comment
                "ignoreWords": [
                    "foo",
                    "bar"
                ],
                "$schema": "${cspellConfigFileSchema}"
            }
        `);
    });

    test('setComment', () => {
        const json = unindent`\
            {
                // This is a comment
                "name": "example",
                "language": "en",
                "ignoreWords": [
                    "foo",
                    "bar"
                ]
            }
        `;
        const file = createTextFile(url, json);
        const configFile = CSpellConfigFileJson.parse(file);

        configFile.setComment('language', ' After "language"', true);
        configFile.setComment('language', ' Language is important');

        const serialized = configFile.serialize();
        expect(serialized).toEqual(unindent`\
            {
                // This is a comment
                "name": "example",
                // Language is important
                "language": "en", // After "language"
                "ignoreWords": [
                    "foo",
                    "bar"
                ]
            }
        `);
    });

    test('should throw an error when parsing an invalid JSON file', () => {
        const json = `{
            "language": "en",
            "ignoreWords": ["foo", "bar"
        }`;
        const file = createTextFile(url, json);
        expect(() => CSpellConfigFileJson.parse(file)).toThrowError();
    });

    test('from', () => {
        const json = `{
            "language": "en",
            "ignoreWords": ["foo", "bar"]
        }`;
        const file = createTextFile(url, json);
        const cfg = parseCSpellConfigFileJson(file);
        const cfgFrom = CSpellConfigFileJson.from(cfg.url, cfg.settings, cfg.indent);
        expect(cfgFrom.settings).toEqual(cfg.settings);
        expect(cfgFrom.serialize()).toEqual(cfg.serialize());
        expect(cfgFrom.url).toEqual(cfg.url);
    });
});
