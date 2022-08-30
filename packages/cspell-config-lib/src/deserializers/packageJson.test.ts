import { deserializerPackageJson } from './packageJson';
import { json } from '../test-helpers/util';
import { defaultNextDeserializer } from '../CSpellConfigFileReaderWriter';

const oc = expect.objectContaining;
const next = defaultNextDeserializer;

describe('packageJson', () => {
    test.each`
        uri                   | content                      | expected
        ${'package.json'}     | ${'{}'}                      | ${oc({ settings: {} })}
        ${'package.json?x=5'} | ${'{"cspell":{"words":[]}}'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(deserializerPackageJson({ uri, content }, next)).toEqual(expected);
    });

    test.each`
        uri               | content             | expected
        ${''}             | ${''}               | ${'Unable to parse config file: ""'}
        ${'cspell.js'}    | ${''}               | ${'Unable to parse config file: "cspell.js"'}
        ${'cspell.json'}  | ${''}               | ${'Unable to parse config file: "cspell.json"'}
        ${'cspell.yaml'}  | ${''}               | ${'Unable to parse config file: "cspell.yaml"'}
        ${'package.json'} | ${''}               | ${'Unexpected end of JSON input'}
        ${'package.json'} | ${'[]'}             | ${'Unable to parse package.json'}
        ${'package.json'} | ${'{"cspell": []}'} | ${'Unable to parse package.json'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => deserializerPackageJson({ uri, content }, next)).toThrow(expected);
    });

    test.each`
        uri                   | content                          | expected
        ${'package.json'}     | ${'{\n\t"name": "name"}'}        | ${json({ name: 'name', cspell: {} }, '\t')}
        ${'package.json?x=5'} | ${'{\n  "cspell":{"words":[]}}'} | ${json({ cspell: { words: [] } }, 2)}
        ${'package.json?x=5'} | ${'{\n  "cspell":{"words":[]}}'} | ${json({ cspell: { words: [] } }, 2)}
    `('serialize $uri', ({ uri, content, expected }) => {
        const file = deserializerPackageJson({ uri, content }, next);
        expect(file?.serialize()).toEqual(expected);
    });
});
