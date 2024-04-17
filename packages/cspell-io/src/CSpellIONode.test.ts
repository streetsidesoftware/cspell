import { promises as fs } from 'fs';
import { basename } from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';

import { CSpellIONode } from './CSpellIONode.js';
import { toFileURL } from './node/file/url.js';
import { makePathToFile, pathToSample as ps, pathToTemp } from './test/test.helper.js';

const sc = expect.stringContaining;
const oc = expect.objectContaining;

describe('CSpellIONode', () => {
    test('constructor', () => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo).toBeDefined();
    });

    test.each`
        filename                                                                     | baseFilename            | content
        ${__filename}                                                                | ${basename(__filename)} | ${sc('This bit of text')}
        ${ps('cities.txt')}                                                          | ${'cities.txt'}         | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')}                                                       | ${'cities.txt.gz'}      | ${sc('San Francisco\n')}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}       | ${'hello.txt'}          | ${sc('Hello, World!')}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'} | ${undefined}            | ${sc('Hello, World!')}
    `('readFile $filename', async ({ filename, content, baseFilename }) => {
        const cspellIo = new CSpellIONode();
        const url = toFileURL(filename);
        const expected = { url, content, baseFilename };
        const result = await cspellIo.readFile(filename);
        const gz = filename.endsWith('.gz') || undefined;
        expect(result.url).toEqual(expected.url);
        expect(result.getText()).toEqual(expected.content);
        expect(result.baseFilename).toEqual(expected.baseFilename);
        expect(!!result.gz).toEqual(!!gz);
    });

    const urlCities =
        'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt';
    const urlCitiesGz =
        'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz';

    test.runIf(process.env['TEST_FETCH']).each`
        filename       | baseFilename       | content
        ${urlCities}   | ${'cities.txt'}    | ${sc('San Francisco\n')}
        ${urlCitiesGz} | ${'cities.txt.gz'} | ${sc('San Francisco\n')}
    `('readFile https $filename', async ({ filename, content, baseFilename }) => {
        const cspellIo = new CSpellIONode();
        const url = toFileURL(filename);
        const expected = { url, content, baseFilename };
        const result = await cspellIo.readFile(filename);
        const gz = filename.endsWith('.gz') || undefined;
        expect(result.url).toEqual(expected.url);
        expect(result.getText()).toEqual(expected.content);
        expect(result.baseFilename).toEqual(expected.baseFilename);
        expect(!!result.gz).toEqual(!!gz);
    });

    test.each`
        baseFilename      | content
        ${'hello.txt'}    | ${'This bit of text'}
        ${'cities.md'}    | ${'San Francisco\n'}
        ${'words.txt.gz'} | ${'one\ntwo\nthree\n'}
    `('dataURL write/readFile $baseFilename', async ({ content, baseFilename }) => {
        const cspellIo = new CSpellIONode();
        const url = toFileURL(`data:text/plain,placeholder`);
        const ref = await cspellIo.writeFile({ url, baseFilename }, content);
        const result = await cspellIo.readFile(ref);
        // console.error('dataURL %o', { ref, result });
        expect(result.getText()).toEqual(content);
        expect(result.baseFilename).toEqual(baseFilename);
        expect(!!result.gz).toEqual(!!baseFilename.endsWith('.gz'));
    });

    test.each`
        filename                         | expected
        ${ps('cities.not_found.txt')}    | ${oc({ code: 'ENOENT' })}
        ${ps('cities.not_found.txt.gz')} | ${oc({ code: 'ENOENT' })}
    `('readFile not found $filename', async ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        await expect(cspellIo.readFile(filename)).rejects.toEqual(expected);
    });

    const urlCitiesNotFound =
        'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.not_found.txt';
    const urlCitiesNotFoundGz =
        'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/not_found/cities.txt.gz';

    test.runIf(process.env['TEST_FETCH']).each`
        filename               | expected
        ${urlCitiesNotFound}   | ${oc({ code: 'ENOENT' })}
        ${urlCitiesNotFoundGz} | ${oc({ code: 'ENOENT' })}
    `('readFile not found https $filename', async ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        await expect(cspellIo.readFile(filename)).rejects.toEqual(expected);
    });

    test.each`
        filename                                                                     | content
        ${__filename}                                                                | ${sc('This bit of text')}
        ${ps('cities.txt')}                                                          | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')}                                                       | ${sc('San Francisco\n')}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}       | ${sc('Hello, World!')}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'} | ${sc('Hello, World!')}
    `('readFileSync $filename', ({ filename, content }) => {
        const cspellIo = new CSpellIONode();
        const result = cspellIo.readFileSync({ url: toFileURL(filename) });
        expect(result.url).toEqual(toFileURL(filename));
        expect(result.getText()).toEqual(content);
    });

    const stats = {
        urlA: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0db5918"', mtimeMs: 0, size: -1 },
        urlB: { eTag: 'W/"10c5e3c7c73159515d4334813d6ba0255230270d92ebfdbd37151db7a0dbffff"', mtimeMs: 0, size: -1 },
        file1: { mtimeMs: 1_658_757_408_444.0342, size: 1886 },
        file2: { mtimeMs: 1_658_757_408_444.0342, size: 2886 },
        file3: { mtimeMs: 1_758_757_408_444.0342, size: 1886 },
    };

    test.each`
        left           | right          | expected
        ${stats.urlA}  | ${stats.urlA}  | ${0}
        ${stats.urlA}  | ${stats.file1} | ${1}
        ${stats.file1} | ${stats.file3} | ${-1}
        ${stats.file2} | ${stats.file3} | ${1}
    `('getStat $left <> $right', async ({ left, right, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.compareStats(left, right);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ eTag: sc('W/') })}
        ${__filename}                                                                       | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStat $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = await cspellIo.getStat(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                              | expected
        ${'https://raw.gitubusrcotent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOTFOUND' })}
        ${ps(__dirname, 'not-found.nf')}                                                 | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.getStat(url);
        await expect(r).rejects.toEqual(expected);
    });

    test.each`
        url           | expected
        ${__filename} | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStatSync $url', ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        const r = cspellIo.getStatSync(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${'The URL must be of scheme file'}
        ${ps(__dirname, 'not-found.nf')}                                                    | ${oc({ code: 'ENOENT' })}
    `('getStatSync with error $url', async ({ url, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(() => cspellIo.getStatSync(url)).toThrow(expected);
    });

    test.each`
        filename
        ${pathToTemp('cities.txt')}
        ${pathToTemp('cities.txt.gz')}
    `('writeFile $filename', async ({ filename }) => {
        const content = await fs.readFile(ps('cities.txt'), 'utf-8');
        const cspellIo = new CSpellIONode();
        await makePathToFile(filename);
        await cspellIo.writeFile(filename, content);
        const result = await cspellIo.readFile(filename);
        expect(result.getText()).toEqual(content);
    });

    test.each`
        filename                                                                          | expected
        ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}            | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}      | ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}
    `('toUrl $filename', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.toURL(filename).toString()).toEqual(expected);
    });

    test.each`
        filename                                                                          | relativeTo               | expected
        ${'samples/cities.txt'}                                                           | ${'file:///usr/local/'}  | ${'file:///usr/local/samples/cities.txt'}
        ${'samples/cities.txt'}                                                           | ${'https://example.com'} | ${'https://example.com/samples/cities.txt'}
        ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'file:///usr/local/'}  | ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}            | ${'file:///usr/local/'}  | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
    `('toUrl relativeTo $filename $relativeTo', ({ filename, relativeTo, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.toURL(filename, relativeTo).toString()).toEqual(expected);
    });

    test.each`
        filename                                                                          | expected
        ${ps('samples/cities.txt')}                                                       | ${sc('samples/cities.txt')}
        ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}            | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}      | ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}
    `('toFileUrl $filename', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.toFileURL(filename).toString()).toEqual(expected);
    });

    test.each`
        filename                                                                          | relativeTo              | expected
        ${ps('samples/cities.txt')}                                                       | ${'file:///usr/local/'} | ${sc('samples/cities.txt')}
        ${'samples/cities.txt'}                                                           | ${'file:///usr/local/'} | ${'file:///usr/local/samples/cities.txt'}
        ${'samples/cities.txt'}                                                           | ${ps()}                 | ${pathToFileURL(ps('samples/cities.txt')).toString()}
        ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'file:///usr/local/'} | ${'https://raw.guc.com/sss/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}            | ${'file:///usr/local/'} | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
    `('toFileUrl relativeTo $filename $relativeTo', ({ filename, relativeTo, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.toFileURL(filename, relativeTo).toString()).toEqual(expected);
    });

    test.each`
        filename                                                                                                       | expected
        ${ps('samples/cities.txt')}                                                                                    | ${'cities.txt'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'https://example.com/examples/code/'}                                                                        | ${'code/'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}                                         | ${'hello.txt'}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}                                   | ${'text.plain'}
    `('uriBasename $filename', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.urlBasename(toFileURL(filename))).toEqual(expected);
    });

    test.each`
        filename                                                                                                       | expected
        ${ps('samples/cities.txt')}                                                                                    | ${sc('samples/')}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'} | ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/'}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}                                         | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}                                   | ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}
    `('uriDirname $filename', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo.urlDirname(toFileURL(filename)).toString()).toEqual(expected);
    });
});
