import { deserializerCSpellJson } from './cspellJson';
import { json } from '../test-helpers/util';
import { defaultNextDeserializer } from '../CSpellConfigFileReaderWriter';

const oc = expect.objectContaining;

const next = defaultNextDeserializer;

describe('cspellJson', () => {
    const sampleCSpellJson = `{
  "version": "0.2",
  // Add words here:
  "words": [
    "cache"
  ]
}
`;

    test.each`
        uri                  | content                                    | expected
        ${'cspell.json'}     | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'cspell-ext.json'} | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'.cspell.json'}    | ${'{\n  // add words here\n  "words":[]}'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(deserializerCSpellJson({ uri, content }, next)).toEqual(expected);
    });

    test.each`
        uri              | content | expected
        ${''}            | ${''}   | ${'Unable to parse config file: ""'}
        ${'cspell.js'}   | ${''}   | ${'Unable to parse config file: "cspell.js"'}
        ${'cspell.yaml'} | ${''}   | ${'Unable to parse config file: "cspell.yaml"'}
        ${'cspell.json'} | ${''}   | ${'Unexpected end of JSON input'}
        ${'cspell.json'} | ${'[]'} | ${'Unable to parse cspell.json'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => deserializerCSpellJson({ uri, content }, next)).toThrowError(expected);
    });

    test.each`
        uri                  | content                   | expected
        ${'cspell.json'}     | ${'{\n\t"name": "name"}'} | ${json({ name: 'name' }, '\t')}
        ${'cspell.json?x=5'} | ${'{\n  "words":[]}'}     | ${json({ words: [] }, 2)}
        ${'cspell.jsonc'}    | ${sampleCSpellJson}       | ${sampleCSpellJson}
    `('serialize $uri', ({ uri, content, expected }) => {
        const file = deserializerCSpellJson({ uri, content }, next);
        expect(file?.serialize()).toEqual(expected);
    });
});
