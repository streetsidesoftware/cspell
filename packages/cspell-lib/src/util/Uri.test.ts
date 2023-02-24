import { URI } from 'vscode-uri';

import type { Uri } from './Uri';
import { isUri, normalizeFsPath, toUri, uriToFilePath } from './Uri';

describe('Uri', () => {
    test.each`
        uri                                 | expected
        ${'https://google.com'}             | ${URIparse('https://google.com')}
        ${URIparse('https://google.com')}   | ${URIparse('https://google.com')}
        ${URIfile(__filename)}              | ${URIfile(__filename)}
        ${UriToString(URIfile(__filename))} | ${URIparse(URI.file(__filename).toString())}
        ${'file.txt'}                       | ${URIfile('file.txt')}
        ${'uri://example.com/'}             | ${URIparse('uri://example.com/')}
        ${'i://example.com/'}               | ${URIparse('i://example.com/')}
        ${'example.com/'}                   | ${URIparse('example.com/')}
    `('toUri $uri', ({ uri, expected }) => {
        const u = toUri(uri);
        expect(u).toEqual(expected);
    });

    test.each`
        uri                               | expected
        ${undefined}                      | ${false}
        ${'uri://example.com'}            | ${false}
        ${URI.parse('uri://example.com')} | ${true}
    `('isUri $uri', ({ uri, expected }) => {
        expect(isUri(uri)).toBe(expected);
    });

    const uriFilename = URI.file(__filename);
    const uriStdinFilename = uriFilename.with({ scheme: 'stdin' }).toString();
    const stdinFilename = uriStdinFilename.toString();

    console.log('%o', { stdinFilename, uri: uriFilename.toString(), uriJ: JSON.parse(JSON.stringify(uriFilename)) });

    test.each`
        uri                                  | expected
        ${URI.file(titleCase(__filename))}   | ${unTitleCase(__filename)}
        ${URI.file(unTitleCase(__filename))} | ${unTitleCase(__filename)}
        ${toUri('D:\\programs\\code.exe')}   | ${'d:\\programs\\code.exe'}
        ${toUri(stdinFilename)}              | ${__filename}
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

function URItoUri(uri: URI): Uri {
    const { authority, scheme, path, query, fragment } = uri;
    const r: Writeable<Uri> = { scheme, path };
    if (authority) r.authority = authority;
    if (query) r.query = query;
    if (fragment) r.fragment = fragment;
    return r;
}

function URIparse(url: string): Uri {
    return URItoUri(URI.parse(url));
}

function URIfile(file: string): Uri {
    return URItoUri(URI.file(file));
}

function UriToString(uri: Uri): string {
    return URI.from(uri).toString();
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
