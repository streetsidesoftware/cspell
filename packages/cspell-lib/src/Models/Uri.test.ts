import { toUri, Uri } from './Uri';

describe('Uri', () => {
    test.each`
        uri                                | expected
        ${'https://google.com'}            | ${Uri.parse('https://google.com')}
        ${Uri.parse('https://google.com')} | ${Uri.parse('https://google.com')}
        ${Uri.file(__filename)}            | ${Uri.file(__filename)}
        ${Uri.file(__filename).toString()} | ${Uri.parse(Uri.file(__filename).toString())}
        ${'file.txt'}                      | ${Uri.file('file.txt')}
        ${'uri://example.com/'}            | ${Uri.parse('uri://example.com/')}
        ${'i://example.com/'}              | ${Uri.parse('i://example.com/')}
        ${'example.com/'}                  | ${Uri.parse('example.com/')}
    `('toUri $uri', ({ uri, expected }) => {
        expect(toUri(uri)).toEqual(expected);
    });
});
