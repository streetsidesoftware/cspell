import assert from 'node:assert';
import { pathToFileURL } from 'node:url';

import { describe, expect, test, vi } from 'vitest';
import { stringify } from 'yaml';

import { CSpellConfigFileYaml } from '../CSpellConfigFile/CSpellConfigFileYaml.js';
import { defaultNextDeserializer } from '../defaultNext.js';
import { serializerCSpellYaml } from './cspellYaml.js';

const oc = expect.objectContaining;
const next = defaultNextDeserializer;

describe('cspellYaml', () => {
    const sampleCSpellYaml = `\
version: "0.2"
words:
  - cache
`;

    test.each`
        uri                 | content                    | expected
        ${'cspell.yaml'}    | ${''}                      | ${oc({ settings: {} })}
        ${'cspell.yaml'}    | ${'---\n{}\n'}             | ${oc({ settings: {} })}
        ${'cspell-ext.yml'} | ${'---\nversion: "0.2"\n'} | ${oc({ settings: { version: '0.2' } })}
        ${'.cspell.yml'}    | ${'\nwords: []\n'}         | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(serializerCSpellYaml.deserialize({ url: pathToFileURL(uri), content }, next)).toEqual(expected);
    });

    test.each`
        uri              | content       | expected
        ${''}            | ${''}         | ${'Unable to parse config file: "file:///"'}
        ${'cspell.js'}   | ${''}         | ${'Unable to parse config file: "file:///cspell.js"'}
        ${'cspell.json'} | ${''}         | ${'Unable to parse config file: "file:///cspell.json"'}
        ${'cspell.yaml'} | ${'"version'} | ${'Missing closing'}
        ${'cspell.yaml'} | ${'[]'}       | ${'Unable to parse file:///cspell.yaml'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => serializerCSpellYaml.deserialize({ url: new URL(uri, 'file:///'), content }, next)).toThrow(
            expected,
        );
    });

    test.each`
        uri                  | content                   | expected
        ${'cspell.yaml'}     | ${'{\n\t"name": "name"}'} | ${toYaml({ name: 'name' }, '\t')}
        ${'cspell.yaml?x=5'} | ${'{\n  "words":[]}'}     | ${toYaml({ words: [] }, 2)}
        ${'cspell.yml'}      | ${sampleCSpellYaml}       | ${sampleCSpellYaml}
    `('serialize $uri', ({ uri, content, expected }) => {
        const next = vi.fn();
        const file = serializerCSpellYaml.deserialize({ url: new URL(uri, 'file:///'), content }, next);
        assert(file instanceof CSpellConfigFileYaml);
        expect(serializerCSpellYaml.serialize(file, next)).toEqual(expected);
        expect(next).toHaveBeenCalledTimes(0);
    });

    test('serialize reject', () => {
        const next = vi.fn();
        serializerCSpellYaml.serialize({ url: new URL('file:///file.txt'), settings: {} }, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});

function toYaml(obj: unknown, indent: string | number = 2): string {
    if (typeof indent === 'string') {
        indent = indent.replace(/\t/g, '    ').replace(/[^ ]/g, '');
        indent = indent.length;
    }
    return stringify(obj, { indent });
}
