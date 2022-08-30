import { deserializerCSpellJson } from './cspellJson';
import { json } from '../test-helpers/util';

const oc = expect.objectContaining;

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
        ${''}                | ${''}                                      | ${undefined}
        ${'cspell.json'}     | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'cspell.js'}       | ${''}                                      | ${undefined}
        ${'cspell.yaml'}     | ${''}                                      | ${undefined}
        ${'cspell-ext.json'} | ${'{}'}                                    | ${oc({ settings: {} })}
        ${'.cspell.json'}    | ${'{\n  // add words here\n  "words":[]}'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(deserializerCSpellJson(uri, content)).toEqual(expected);
    });

    test.each`
        uri              | content | expected
        ${'cspell.json'} | ${''}   | ${'Unexpected end of JSON input'}
        ${'cspell.json'} | ${'[]'} | ${'Unable to parse cspell.json'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => deserializerCSpellJson(uri, content)).toThrow(expected);
    });

    test.each`
        uri                  | content                   | expected
        ${'cspell.json'}     | ${'{\n\t"name": "name"}'} | ${json({ name: 'name' }, '\t')}
        ${'cspell.json?x=5'} | ${'{\n  "words":[]}'}     | ${json({ words: [] }, 2)}
        ${'cspell.jsonc'}    | ${sampleCSpellJson}       | ${sampleCSpellJson}
    `('serialize $uri', ({ uri, content, expected }) => {
        const file = deserializerCSpellJson(uri, content);
        expect(file?.serialize()).toEqual(expected);
    });
});
