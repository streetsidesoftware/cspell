import { URI } from 'vscode-uri';

import { isUri, normalizeFsPath, toUri, Uri, uriToFilePath } from './Uri';

describe('Uri', () => {
    test.each`
        uri                                | expected
        ${'https://google.com'}            | ${URI.parse('https://google.com')}
        ${Uri.parse('https://google.com')} | ${URI.parse('https://google.com')}
        ${Uri.file(__filename)}            | ${URI.file(__filename)}
        ${Uri.file(__filename).toString()} | ${URI.parse(Uri.file(__filename).toString())}
        ${'file.txt'}                      | ${URI.file('file.txt')}
        ${'uri://example.com/'}            | ${URI.parse('uri://example.com/')}
        ${'i://example.com/'}              | ${URI.parse('i://example.com/')}
        ${'example.com/'}                  | ${URI.parse('example.com/')}
    `('toUri $uri', ({ uri, expected }) => {
        expect(toUri(uri)).toEqual(expected);
    });

    test.each`
        uri                               | expected
        ${undefined}                      | ${false}
        ${'uri://example.com'}            | ${false}
        ${Uri.parse('uri://example.com')} | ${true}
    `('isUri $uri', ({ uri, expected }) => {
        expect(isUri(uri)).toBe(expected);
    });

    test.each`
        uri                                  | expected
        ${Uri.file(titleCase(__filename))}   | ${unTitleCase(__filename)}
        ${Uri.file(unTitleCase(__filename))} | ${unTitleCase(__filename)}
        ${toUri('D:\\programs\\code.exe')}   | ${'d:\\programs\\code.exe'}
        ${toUri('stdin://' + __filename)}    | ${__filename}
    `('uriToFilePath $uri', ({ uri, expected }) => {
        expect(uriToFilePath(uri)).toBe(expected);
    });

    test.each`
        uri                         | expected
        ${titleCase(__filename)}    | ${unTitleCase(__filename)}
        ${unTitleCase(__filename)}  | ${unTitleCase(__filename)}
        ${'D:\\programs\\code.exe'} | ${'d:\\programs\\code.exe'}
        ${'d:\\programs\\code.exe'} | ${'d:\\programs\\code.exe'}
    `('uriToFilePath $uri', ({ uri, expected }) => {
        expect(normalizeFsPath(uri)).toBe(expected);
    });
});

function titleCase(s: string): string {
    return s && s[0].toUpperCase() + s.slice(1);
}

function unTitleCase(s: string): string {
    return s && s[0].toLowerCase() + s.slice(1);
}
