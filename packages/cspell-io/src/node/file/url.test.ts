import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { basename, isUrlLike, toFileURL, toURL, urlBasename, urlDirname } from './url.js';

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
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                                                 | ${'data:text/plain;charset=utf8,Hello%2C%20World!'}
        ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}                                    | ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}
        ${'data:application/gzip;base64,H'}                                                                 | ${'data:application/gzip;base64,H'}
        ${toFileURL('data:application/gzip;base64,H')}                                                      | ${'data:application/gzip;base64,H'}
        ${'data:application/vnd.cspell.dictionary+trie,H'}                                                  | ${'data:application/vnd.cspell.dictionary+trie,H'}
    `('urlDirname $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : toFileURL(path.resolve(root, file));
        expect(urlDirname(filename).toString()).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'/'}                                                                                              | ${''}
        ${'samples/cities.txt'}                                                                             | ${'cities.txt'}
        ${'samples/cities.txt.gz'}                                                                          | ${'cities.txt.gz'}
        ${'samples/code/'}                                                                                  | ${'code'}
        ${'file://samples/code/'}                                                                           | ${'code'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'cities.txt'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/code/'}         | ${'code'}
    `('basename $file', async ({ file, expected }) => {
        expect(basename(file)).toEqual(expected);
        expect(basename(file)).toEqual(path.basename(file));
    });
});
