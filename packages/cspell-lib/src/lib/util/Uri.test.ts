import Path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';
import { URI } from 'vscode-uri';

import { pathRepoTestFixtures } from '../../test-util/index.mjs';
import { extendExpect } from '../../test-util/test.matchers.mjs';
import type { Uri, UriInstance } from './Uri.js';
import {
    from,
    fromFilePath,
    fromStdinFilePath,
    isUri,
    normalizeDriveLetter,
    parse,
    toUri,
    uriToFilePath,
} from './Uri.js';

const { toEqualCaseInsensitive } = extendExpect(expect);

const eqCI = toEqualCaseInsensitive;
const sc = expect.stringContaining;

const u = { scheme: '', path: '', query: '', fragment: '', authority: '' };

describe('Uri', () => {
    test.each`
        uri                                                 | expected
        ${'https://google.com'}                             | ${{ ...u, ...URIparse('https://google.com') }}
        ${URIparse('https://google.com')}                   | ${{ ...u, ...URIparse('https://google.com') }}
        ${URIfile(__filename)}                              | ${{ ...u, ...URIfile(__filename) }}
        ${UriToString(URIfile(__filename))}                 | ${{ ...u, ...URIparse(URI.file(__filename).toString()) }}
        ${'file.txt'}                                       | ${{ ...u, ...URIfile('file.txt') }}
        ${'uri://example.com/'}                             | ${{ ...u, ...URIparse('uri://example.com/') }}
        ${'i://example.com/'}                               | ${{ ...u, ...URIparse('i://example.com/') }}
        ${'stdin:D:\\home\\prj\\code.c'}                    | ${{ ...u, scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin:/D:\\home\\prj\\code.c'}                   | ${{ ...u, scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin://D:\\home\\prj\\code.c'}                  | ${{ ...u, scheme: 'stdin', path: 'd:/home/prj/code.c' }}
        ${'stdin:///D:\\home\\prj\\code.c'}                 | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${'stdin:///D:\\home\\prj\\code.c?q=42'}            | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c', query: 'q=42' }}
        ${'stdin:///D:\\home\\prj\\code.c#README'}          | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c', fragment: 'README' }}
        ${'stdin:///D:\\home\\prj\\code.c?q=42&a=9#README'} | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c', query: 'q=42&a=9', fragment: 'README' }}
        ${'stdin://readme.md?'}                             | ${{ ...u, scheme: 'stdin', path: 'readme.md' }}
        ${'stdin://readme.md#'}                             | ${{ ...u, scheme: 'stdin', path: 'readme.md' }}
        ${'stdin:#README'}                                  | ${{ ...u, scheme: 'stdin', path: '', fragment: 'README' }}
        ${'stdin:?README'}                                  | ${{ ...u, scheme: 'stdin', path: '', query: 'README' }}
        ${'stdin://readme.md?#README'}                      | ${{ ...u, scheme: 'stdin', path: 'readme.md', fragment: 'README' }}
        ${'stdin://readme.md#?#README'}                     | ${{ ...u, scheme: 'stdin', path: 'readme.md', fragment: '?#README' }}
        ${encodeURI('stdin:///D:\\home\\prj\\code.c')}      | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${fromStdinFilePath('D:\\home\\prj\\code.c')}       | ${{ ...u, scheme: 'stdin', path: '/d:/home/prj/code.c' }}
        ${fromStdinFilePath(__filename)}                    | ${{ ...u, scheme: 'stdin', path: normalizePath(__filename) }}
        ${'example.com/'}                                   | ${{ ...u, ...URIparse('example.com/') }}
    `('toUri $uri', ({ uri, expected }) => {
        const u = toUri(uri);
        expect(j(u)).toEqual(expected);
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
        uri                                                                                        | expected
        ${toUri('file:///d:/a/src/sample.c').toString()}                                           | ${new URL('file:///d:/a/src/sample.c').toString()}
        ${toUri('file:///d:/a/src/sample.c').toString()}                                           | ${'file:///d:/a/src/sample.c'}
        ${toUri('file:///d:/a/src files/sample.c').toString()}                                     | ${new URL('file:///d:/a/src files/sample.c').toString()}
        ${toUri('https://g.com/maps?lat=43.23&lon=-0.5#first').toString()}                         | ${new URL('https://g.com/maps?lat=43.23&lon=-0.5#first').toString()}
        ${uriToFilePath(fromFilePath(__filename))}                                                 | ${eqCI(__filename)}
        ${uriToFilePath(fromFilePath(pTestFixtures('issues/issue-4811/#local/README.md')))}        | ${normalizePath(pTestFixtures('issues/issue-4811/#local/README.md'))}
        ${urlFile(pTestFixtures('issues/issue-4811/#local/README.md')).href}                       | ${sc('/%23local/README.md')}
        ${URI.parse(urlFile(pTestFixtures('issues/issue-4811/#local/README.md')).href).toString()} | ${sc('/%23local/README.md')}
        ${URI.file(pTestFixtures('issues/issue-4811/#local/README.md')).toString()}                | ${sc('/%23local/README.md')}
        ${toUri(urlFile(pTestFixtures('issues/issue-4811/#local/README.md'))).toString()}          | ${sc('/%23local/README.md')}
        ${toUri('stdin://relative/file/path').toString()}                                          | ${'stdin://relative/file/path'}
        ${toUri('stdin:///absolute-file-path').toString()}                                         | ${'stdin:///absolute-file-path'}
        ${JSON.stringify(toUri('stdin:relative_file_path'))}                                       | ${'{"scheme":"stdin","authority":"","path":"relative_file_path","query":"","fragment":""}'}
        ${JSON.stringify(toUri('stdin:relative/file/path'))}                                       | ${'{"scheme":"stdin","authority":"","path":"relative/file/path","query":"","fragment":""}'}
        ${JSON.stringify(toUri('stdin://relative/file/path'))}                                     | ${'{"scheme":"stdin","authority":"","path":"relative/file/path","query":"","fragment":""}'}
        ${JSON.stringify(toUri('stdin:///absolute-file-path'))}                                    | ${'{"scheme":"stdin","authority":"","path":"/absolute-file-path","query":"","fragment":""}'}
    `('uri as string assumptions $uri', ({ uri, expected }) => {
        expect(uri).toEqual(expected);
    });

    test.each`
        uri                                                                 | expected
        ${j(toUri({ scheme: 'file', path: '/d:/a//sample.c' }))}            | ${{ ...u, scheme: 'file', path: '/d:/a//sample.c' }}
        ${j(toUri(URI.from({ scheme: 'file', path: 'd:/a//sample.c' })))}   | ${{ ...u, scheme: 'file', path: '/d:/a//sample.c' }}
        ${j(toUri('file:///d%3A/a//sample.c'))}                             | ${{ ...u, scheme: 'file', path: '/d:/a//sample.c' }}
        ${j(toUri('file:///d:/a/src/sample.c'))}                            | ${{ ...u, scheme: 'file', path: '/d:/a/src/sample.c' }}
        ${j(toUri('https://g.com/maps?lat=43.23&lon=-0.5#first'))}          | ${{ ...u, scheme: 'https', path: '/maps', query: 'lat=43.23&lon=-0.5', fragment: 'first', authority: 'g.com' }}
        ${j(toUri(new URL('https://g.com/maps?lat=43.23&lon=-0.5#first')))} | ${{ ...u, scheme: 'https', path: '/maps', query: 'lat=43.23&lon=-0.5', fragment: 'first', authority: 'g.com' }}
        ${j(parse('https://google.com/maps'))}                              | ${{ ...u, scheme: 'https', authority: 'google.com', path: '/maps' }}
        ${j(toUri('file:relative_file'))}                                   | ${{ ...u, scheme: 'file', path: '/relative_file' }}
        ${j(toUri('stdin://relative/file/path'))}                           | ${{ ...u, scheme: 'stdin', path: 'relative/file/path' }}
        ${toUri('stdin://relative/file/path').toString()}                   | ${'stdin://relative/file/path'}
        ${toUri('stdin:///absolute-file-path').toString()}                  | ${'stdin:///absolute-file-path'}
        ${j(from(URI.file(__filename)))}                                    | ${{ ...u, scheme: 'file', path: eqCI(normalizePath(__filename)) }}
        ${j(from(URI.file(__filename), { scheme: 'stdin' }))}               | ${{ ...u, scheme: 'stdin', path: eqCI(normalizePath(__filename)) }}
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

function pTestFixtures(...parts: string[]): string {
    return Path.resolve(pathRepoTestFixtures, ...parts);
}

function urlFile(path: string): URL {
    return pathToFileURL(path);
}

function j(uri: URI | UriInstance | string) {
    return uri instanceof URI ? { ...uri.toJSON() } : uri;
}
