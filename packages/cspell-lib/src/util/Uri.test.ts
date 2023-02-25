import { URI } from 'vscode-uri';

import { extendExpect } from '../test/test.matchers';
import type { Uri } from './Uri';
import { from, fromFilePath, fromStdinFilePath, isUri, normalizeDriveLetter, parse, toUri, uriToFilePath } from './Uri';

const { toEqualCaseInsensitive } = extendExpect(expect);

const eqCI = toEqualCaseInsensitive;

describe('Uri', () => {
    test.each`
        uri                                                 | expected
        ${'https://google.com'}                             | ${URIparse('https://google.com')}
        ${URIparse('https://google.com')}                   | ${URIparse('https://google.com')}
        ${URIfile(__filename)}                              | ${URIfile(__filename)}
        ${UriToString(URIfile(__filename))}                 | ${URIparse(URI.file(__filename).toString())}
        ${'file.txt'}                                       | ${URIfile('file.txt')}
        ${'uri://example.com/'}                             | ${URIparse('uri://example.com/')}
        ${'i://example.com/'}                               | ${URIparse('i://example.com/')}
        ${'stdin:D:\\home\\prj\\code.c'}                    | ${{ scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin:/D:\\home\\prj\\code.c'}                   | ${{ scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin://D:\\home\\prj\\code.c'}                  | ${{ scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin:///D:\\home\\prj\\code.c'}                 | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${'stdin:///D:\\home\\prj\\code.c?q=42'}            | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c', query: 'q=42' }}
        ${'stdin:///D:\\home\\prj\\code.c#README'}          | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c', fragment: 'README' }}
        ${'stdin:///D:\\home\\prj\\code.c?q=42&a=9#README'} | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c', query: 'q=42&a=9', fragment: 'README' }}
        ${'stdin://readme.md?'}                             | ${{ scheme: 'stdin', path: 'readme.md' }}
        ${'stdin://readme.md#'}                             | ${{ scheme: 'stdin', path: 'readme.md' }}
        ${'stdin:#README'}                                  | ${{ scheme: 'stdin', path: '', fragment: 'README' }}
        ${'stdin:?README'}                                  | ${{ scheme: 'stdin', path: '', query: 'README' }}
        ${'stdin://readme.md?#README'}                      | ${{ scheme: 'stdin', path: 'readme.md', fragment: 'README' }}
        ${'stdin://readme.md#?#README'}                     | ${{ scheme: 'stdin', path: 'readme.md', fragment: '?#README' }}
        ${encodeURI('stdin:///D:\\home\\prj\\code.c')}      | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${fromStdinFilePath('D:\\home\\prj\\code.c')}       | ${{ scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${fromStdinFilePath(__filename)}                    | ${{ scheme: 'stdin', path: normalizePath(__filename) }}
        ${'example.com/'}                                   | ${URIparse('example.com/')}
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
    const uriStdinFilename = from(uriFilename, { scheme: 'stdin' });
    const stdinFilename = uriStdinFilename.toString();

    test.each`
        uri                                                                | expected
        ${toUri({ scheme: 'file', path: '/d:/a//sample.c' })}              | ${{ scheme: 'file', path: '/d:/a//sample.c' }}
        ${toUri(URI.from({ scheme: 'file', path: 'd:/a//sample.c' }))}     | ${{ scheme: 'file', path: '/d:/a//sample.c' }}
        ${toUri('file:///d%3A/a//sample.c')}                               | ${{ scheme: 'file', path: '/d:/a//sample.c' }}
        ${toUri('file:///d:/a/src/sample.c')}                              | ${{ scheme: 'file', path: '/d:/a/src/sample.c' }}
        ${toUri('file:///d:/a/src/sample.c').toString()}                   | ${new URL('file:///d:/a/src/sample.c').toString()}
        ${toUri('file:///d:/a/src/sample.c').toString()}                   | ${'file:///d:/a/src/sample.c'}
        ${toUri('file:///d:/a/src files/sample.c').toString()}             | ${new URL('file:///d:/a/src files/sample.c').toString()}
        ${toUri('https://g.com/maps?lat=43.23&lon=-0.5#first')}            | ${{ scheme: 'https', path: '/maps', query: 'lat=43.23&lon=-0.5', fragment: 'first', authority: 'g.com' }}
        ${toUri(new URL('https://g.com/maps?lat=43.23&lon=-0.5#first'))}   | ${{ scheme: 'https', path: '/maps', query: 'lat=43.23&lon=-0.5', fragment: 'first', authority: 'g.com' }}
        ${toUri('https://g.com/maps?lat=43.23&lon=-0.5#first').toString()} | ${new URL('https://g.com/maps?lat=43.23&lon=-0.5#first').toString()}
        ${uriToFilePath(fromFilePath(__filename))}                         | ${eqCI(__filename)}
        ${parse('https://google.com/maps')}                                | ${{ scheme: 'https', authority: 'google.com', path: '/maps' }}
        ${toUri('file:relative_file')}                                     | ${{ scheme: 'file', path: '/relative_file' }}
        ${toUri('stdin://relative/file/path')}                             | ${{ scheme: 'stdin', path: 'relative/file/path' }}
        ${toUri('stdin://relative/file/path').toString()}                  | ${'stdin://relative/file/path'}
        ${toUri('stdin:///absolute-file-path').toString()}                 | ${'stdin:///absolute-file-path'}
        ${JSON.stringify(toUri('stdin:relative_file_path'))}               | ${'{"scheme":"stdin","path":"relative_file_path"}'}
        ${JSON.stringify(toUri('stdin:relative/file/path'))}               | ${'{"scheme":"stdin","path":"relative/file/path"}'}
        ${JSON.stringify(toUri('stdin://relative/file/path'))}             | ${'{"scheme":"stdin","path":"relative/file/path"}'}
        ${JSON.stringify(toUri('stdin:///absolute-file-path'))}            | ${'{"scheme":"stdin","path":"/absolute-file-path"}'}
        ${from(URI.file(__filename))}                                      | ${{ scheme: 'file', path: eqCI(normalizePath(__filename)) }}
        ${from(URI.file(__filename), { scheme: 'stdin' })}                 | ${{ scheme: 'stdin', path: eqCI(normalizePath(__filename)) }}
    `('uri assumptions $uri', ({ uri, expected }) => {
        expect(uri).toEqual(expected);
    });

    test.each`
        uri                                  | expected
        ${URI.file(titleCase(__filename))}   | ${unTitleCase(__filename)}
        ${URI.file(unTitleCase(__filename))} | ${unTitleCase(__filename)}
        ${toUri(stdinFilename)}              | ${unTitleCase(__filename)}
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
        expect(normalizeDriveLetter(uri)).toBe(expected);
    });
});

function titleCase(s: string): string {
    return s && s[0].toUpperCase() + s.slice(1);
}

function unTitleCase(s: string): string {
    return s && s[0].toLowerCase() + s.slice(1);
}

function normalizePath(path: string): string {
    const p = normalizeDriveLetter(path.replace(/\\/g, '/'));
    return p.startsWith('/') ? p : '/' + p;
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
