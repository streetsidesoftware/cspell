import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { urlBasename } from './dataUrl.mjs';
import { FileUrlBuilder, normalizeFilePathForUrl, toFileURL } from './fileUrl.mjs';
import { isUrlLike, toURL, urlParent } from './url.mjs';

const root = path.join(__dirname, '../..');
const oc = expect.objectContaining;
// const sc = expect.stringContaining;
const sm = expect.stringMatching;

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
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${oc({ protocol: 'file:' })}
        ${'samples/cities.txt.gz'}                                                                          | ${oc({ protocol: 'file:' })}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${oc({ protocol: 'https:' })}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${oc({ protocol: 'https:' })}
    `('toFileURL $file', async ({ file, expected }) => {
        const url = toFileURL(file, root);
        expect(url).toEqual(expected);
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
        const filename = isUrlLike(file) ? file : toFileURL(path.resolve(root, file));
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
        const filename = isUrlLike(file) ? file : toFileURL(path.resolve(root, file));
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
});
