import * as Path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { urlBasename } from './dataUrl.mjs';
import { normalizeFilePathForUrl, toFileDirURL, toFileURL } from './defaultFileUrlBuilder.mjs';
import { toFilePathOrHref, windowsDriveLetterToUpper } from './fileUrl.mjs';
import { FileUrlBuilder } from './FileUrlBuilder.mjs';
import { isUrlLike, toURL, urlParent } from './url.mjs';

const root = Path.join(__dirname, '../..');
// const oc = <T>(obj: T) => expect.objectContaining(obj);
// const sc = (m: string) => expect.stringContaining(m);
const sm = (m: string | RegExp) => expect.stringMatching(m);

const cwdURL = pathToFileURL('.');

describe('util', () => {
    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${false}
        ${'samples/cities.txt.gz'}                                                                          | ${false}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${true}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${true}
        ${'vsls:/cspell.config.yaml'}                                                                       | ${true}
    `('isUrlLike $file', ({ file, expected }) => {
        expect(isUrlLike(file)).toBe(expected);
    });

    test.each`
        file                                                                       | expected
        ${'samples/cities.txt'}                                                    | ${uh('samples/cities.txt')}
        ${'samples/cities.txt.gz'}                                                 | ${uh('samples/cities.txt.gz')}
        ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt.gz'} | ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt.gz'}
        ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt'}    | ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt'}
    `('toFileURL $file', async ({ file, expected }) => {
        const url = toFileURL(file, root);
        expect(url.href).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${'cities.txt'}
        ${'samples/cities.txt.gz'}                                                                          | ${'cities.txt.gz'}
        ${'https://example.com/dir/file.txt'}                                                               | ${'file.txt'}
        ${'https://example.com/dir/'}                                                                       | ${'dir/'}
        ${'https://example.com/dir/path/'}                                                                  | ${'path/'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'cities.txt'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                                                 | ${'text.plain'}
        ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}                                    | ${'cities.txt'}
        ${'data:'}                                                                                          | ${''}
        ${'data:application/gzip;base64,H'}                                                                 | ${'application.gzip'}
        ${toURL('data:application/gzip;base64,H')}                                                          | ${'application.gzip'}
        ${'data:application/vnd.cspell.dictionary+trie,H'}                                                  | ${'application.vnd.cspell.dictionary.trie'}
    `('urlBasename $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : toFileURL(Path.resolve(root, file));
        expect(urlBasename(filename)).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${sm(/file:.*\/samples\/$/)}
        ${'samples/cities.txt.gz'}                                                                          | ${sm(/file:.*\/samples\/$/)}
        ${'samples/code/'}                                                                                  | ${sm(/file:.*\/samples\/$/)}
        ${'file://samples/code/'}                                                                           | ${sm(/file:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/code/'}         | ${sm(/https:.*\/samples\/$/)}
    `('urlDirname $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : toFileURL(Path.resolve(root, file));
        expect(urlParent(filename).toString()).toEqual(expected);
    });

    test.each`
        path               | expected
        ${'path/to/file'}  | ${'path/to/file'}
        ${'/some/path%.c'} | ${'/some/path%25.c'}
    `('normalizePathForUrl $path', ({ path, expected }) => {
        expect(normalizeFilePathForUrl(path)).toEqual(expected);
    });

    test.each`
        path                     | windows | expected
        ${'path/to/file'}        | ${true} | ${'path/to/file'}
        ${'path\\to\\file.txt'}  | ${true} | ${'path/to/file.txt'}
        ${'C:/path/to/file'}     | ${true} | ${'/C:/path/to/file'}
        ${'d:/path/to/file'}     | ${true} | ${'/D:/path/to/file'}
        ${'http://example.com/'} | ${true} | ${'http://example.com/'}
        ${'path/to/file/'}       | ${true} | ${'path/to/file/'}
        ${'path/to/file\\'}      | ${true} | ${'path/to/file/'}
        ${'path\\to\\file/'}     | ${true} | ${'path/to/file/'}
        ${'path\\to/file/'}      | ${true} | ${'path/to/file/'}
        ${'path/to/file,/#'}     | ${true} | ${'path/to/file,/%23'}
        ${'path/to/file\\'}      | ${true} | ${'path/to/file/'}
        ${'path\\to/file/'}      | ${true} | ${'path/to/file/'}
        ${'/some/path%.c'}       | ${true} | ${'/some/path%25.c'}
    `('normalizePathForUrl $path, $windows', ({ path, windows, expected }) => {
        const fileUrlBuilder = new FileUrlBuilder({ windows });
        expect(fileUrlBuilder.normalizeFilePathForUrl(path)).toEqual(expected);
    });

    test.each`
        url                           | expected
        ${toFileURL('file.txt')}      | ${Path.resolve('file.txt')}
        ${toFileURL('file.txt').href} | ${Path.resolve('file.txt')}
        ${import.meta.url}            | ${fileURLToPath(import.meta.url)}
        ${'stdin:sample.py'}          | ${'stdin:sample.py'}
    `('toFilePathOrHref $url', ({ url, expected }) => {
        expect(toFilePathOrHref(url)).toEqual(expected);
    });

    test.each`
        url                        | expected
        ${toFileURL('./').href}    | ${pathToFileURL('./').href}
        ${'.'}                     | ${pathToFileURL('./').href}
        ${'data:application/json'} | ${'data:application/json'}
        ${'stdin:file.txt'}        | ${'stdin:file.txt'}
        ${'stdin:/path/to/dir'}    | ${'stdin:/path/to/dir/'}
    `('toFileDirURL $url', ({ url, expected }) => {
        expect(toFileDirURL(url).href).toEqual(expected);
    });

    test.each`
        path                         | expected
        ${'d:\\user\\data\\file.md'} | ${'D:\\user\\data\\file.md'}
        ${'c:/user/data/file.md'}    | ${'C:/user/data/file.md'}
        ${'data:application/json'}   | ${'data:application/json'}
        ${'stdin:file.txt'}          | ${'stdin:file.txt'}
        ${'stdin:/path/to/dir'}      | ${'stdin:/path/to/dir'}
    `('windowsDriveLetterToUpper $path', ({ path, expected }) => {
        expect(windowsDriveLetterToUpper(path)).toEqual(expected);
    });
});

function u(path: string, relativeURL?: string | URL) {
    return new URL(path, relativeURL);
}

function uh(path: string, relativeURL = cwdURL) {
    return u(path, relativeURL).href;
}
