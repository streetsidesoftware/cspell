import { describe, expect, test } from 'vitest';

import { createTextFile } from '../TextFile.js';
import { CSpellConfigFileJson } from './CSpellConfigFileJson.js';

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

    test('should throw an error when parsing an invalid JSON file', () => {
        const json = `{
            "language": "en",
            "ignoreWords": ["foo", "bar"
        }`;
        const file = createTextFile(url, json);
        expect(() => CSpellConfigFileJson.parse(file)).toThrowError();
    });
});
