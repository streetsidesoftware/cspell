import { deserializerCSpellYaml } from './cspellYaml';
import { stringify } from 'yaml';
import { defaultNextDeserializer } from '../CSpellConfigFileReaderWriter';

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
        expect(deserializerCSpellYaml({ uri, content }, next)).toEqual(expected);
    });

    test.each`
        uri              | content       | expected
        ${''}            | ${''}         | ${'Unable to parse config file: ""'}
        ${'cspell.js'}   | ${''}         | ${'Unable to parse config file: "cspell.js"'}
        ${'cspell.json'} | ${''}         | ${'Unable to parse config file: "cspell.json"'}
        ${'cspell.yaml'} | ${'"version'} | ${'Missing closing'}
        ${'cspell.yaml'} | ${'[]'}       | ${'Unable to parse cspell.yaml'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => deserializerCSpellYaml({ uri, content }, next)).toThrow(expected);
    });

    test.each`
        uri                  | content                   | expected
        ${'cspell.yaml'}     | ${'{\n\t"name": "name"}'} | ${toYaml({ name: 'name' }, '\t')}
        ${'cspell.yaml?x=5'} | ${'{\n  "words":[]}'}     | ${toYaml({ words: [] }, 2)}
        ${'cspell.yml'}      | ${sampleCSpellYaml}       | ${sampleCSpellYaml}
    `('serialize $uri', ({ uri, content, expected }) => {
        const file = deserializerCSpellYaml({ uri, content }, next);
        expect(file?.serialize()).toEqual(expected);
    });
});

function toYaml(obj: unknown, indent: string | number = 2): string {
    if (typeof indent === 'string') {
        indent = indent.replace(/\t/g, '    ').replace(/[^ ]/g, '');
        indent = indent.length;
    }
    return stringify(obj, { indent });
}
