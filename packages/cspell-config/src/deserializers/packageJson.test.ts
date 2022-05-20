import { deserializerPackageJson } from './packageJson';
import { json } from '../test-helpers/util';

const oc = expect.objectContaining;

describe('packageJson', () => {
    test.each`
        uri                   | content                      | expected
        ${''}                 | ${''}                        | ${undefined}
        ${'cspell.json'}      | ${''}                        | ${undefined}
        ${'cspell.js'}        | ${''}                        | ${undefined}
        ${'cspell.yaml'}      | ${''}                        | ${undefined}
        ${'package.json'}     | ${'{}'}                      | ${oc({ settings: {} })}
        ${'package.json?x=5'} | ${'{"cspell":{"words":[]}}'} | ${oc({ settings: { words: [] } })}
    `('success $uri', ({ uri, content, expected }) => {
        expect(deserializerPackageJson(uri, content)).toEqual(expected);
    });

    test.each`
        uri               | content             | expected
        ${'package.json'} | ${''}               | ${'Unexpected end of JSON input'}
        ${'package.json'} | ${'[]'}             | ${'Unable to parse package.json'}
        ${'package.json'} | ${'{"cspell": []}'} | ${'Unable to parse package.json'}
    `('fail $uri', ({ uri, content, expected }) => {
        expect(() => deserializerPackageJson(uri, content)).toThrowError(expected);
    });

    test.each`
        uri                   | content                          | expected
        ${'package.json'}     | ${'{\n\t"name": "name"}'}        | ${json({ name: 'name', cspell: {} }, '\t')}
        ${'package.json?x=5'} | ${'{\n  "cspell":{"words":[]}}'} | ${json({ cspell: { words: [] } }, 2)}
    `('serialize $uri', ({ uri, content, expected }) => {
        const file = deserializerPackageJson(uri, content);
        expect(file?.serialize()).toEqual(expected);
    });
});
