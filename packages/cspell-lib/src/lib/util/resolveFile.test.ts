import { parse } from 'comment-json';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';

import { __testing__, resolveFile } from './resolveFile.js';
import { toFilePathOrHref } from './url.js';

interface Config {
    import: string[];
}

const defaultConfigFile = require.resolve('@cspell/cspell-bundled-dicts/cspell-default.json');
const defaultConfigLocation = path.dirname(defaultConfigFile);

const config = readConfig(defaultConfigFile);

const notFound = '1fgh0dld6y56cr1wls.r9bp0ckc00ds0gna.json';
const userNotFound = path.join('~', notFound);

const rr = {
    '@cspell/dict-cpp/cspell-ext.json': require.resolve('@cspell/dict-cpp/cspell-ext.json'),
    vitest: require.resolve('vitest'),
};

const oc = expect.objectContaining;

const { isFileURL, tryUrl } = __testing__;

describe('Validate resolveFile', () => {
    interface ResolveFileTest {
        filename: string;
        relativeTo: string | URL;
        expected: string;
        found: boolean;
    }

    test.each`
        filename                                      | relativeTo                        | expected                                           | found
        ${__filename}                                 | ${__dirname}                      | ${__filename}                                      | ${true}
        ${'.' + path.sep + path.basename(__filename)} | ${__dirname}                      | ${__filename}                                      | ${true}
        ${'.' + path.sep + path.basename(__filename)} | ${pathToFileURL(__dirname + '/')} | ${__filename}                                      | ${true}
        ${'.' + path.sep + path.basename(__filename)} | ${pathToFileURL(__dirname)}       | ${__filename}                                      | ${true}
        ${'.' + path.sep + 'my-file.txt'}             | ${pathToFileURL(__filename)}      | ${path.resolve(__dirname, 'my-file.txt')}          | ${false}
        ${'.' + path.sep + 'search.ts'}               | ${pathToFileURL(__filename)}      | ${path.resolve(__dirname, 'search.ts')}            | ${true}
        ${'.' + path.sep + notFound}                  | ${__dirname}                      | ${path.resolve(__dirname, notFound)}               | ${false}
        ${path.relative(__dirname, __filename)}       | ${__dirname}                      | ${__filename}                                      | ${true}
        ${'@cspell/dict-cpp/cspell-ext.json'}         | ${__dirname}                      | ${rr['@cspell/dict-cpp/cspell-ext.json']}          | ${true}
        ${'cspell-ext.json'}                          | ${__dirname}                      | ${'cspell-ext.json'}                               | ${false}
        ${'vitest'}                                   | ${__dirname}                      | ${rr['vitest']}                                    | ${true}
        ${userNotFound}                               | ${__dirname}                      | ${path.resolve(path.join(os.homedir(), notFound))} | ${false}
        ${'https://google.com/file.txt'}              | ${__dirname}                      | ${'https://google.com/file.txt'}                   | ${true}
        ${'file.txt'}                                 | ${'https://google.com'}           | ${'https://google.com/file.txt'}                   | ${true}
        ${'file.txt'}                                 | ${'https://google.com/search'}    | ${'https://google.com/file.txt'}                   | ${true}
    `('resolveFile $filename rel $relativeTo', ({ filename, relativeTo, expected, found }: ResolveFileTest) => {
        const r = resolveFile(filename, relativeTo);
        expect(r.filename).toBe(expected);
        expect(r.found).toBe(found);
    });

    test.each(
        config.import
            .map((f) => ({
                filename: f,
                relativeTo: defaultConfigLocation,
                expected: require.resolve(f, { paths: [defaultConfigLocation] }),
                found: true,
            }))
            .map(({ filename, relativeTo, expected, found }) => [filename, relativeTo, expected, found]),
    )('resolveFile "%s" rel "%s"', (filename: string, relativeTo: string, expected: string, found: boolean) => {
        const r = resolveFile(filename, relativeTo);
        expect(r.filename).toBe(expected);
        expect(r.found).toBe(found);
    });

    test.each`
        url                              | expected
        ${'/User/home'}                  | ${false}
        ${'file:///User/home'}           | ${true}
        ${import.meta.url}               | ${true}
        ${new URL('.', import.meta.url)} | ${true}
    `('isFileURL $url', ({ url, expected }) => {
        expect(isFileURL(url)).toBe(expected);
    });

    test.each`
        url                     | relativeTo                     | expected
        ${'/User/home'}         | ${import.meta.url}             | ${oc({ filename: '/User/home', found: false })}
        ${uh('/User/not-home')} | ${import.meta.url}             | ${oc({ filename: fileURLToPath(u('/User/not-home')), found: false })}
        ${import.meta.url}      | ${import.meta.url}             | ${oc({ filename: toFilePathOrHref(new URL(import.meta.url)), found: true })}
        ${'file.txt'}           | ${'https://google.com'}        | ${oc({ filename: 'https://google.com/file.txt', found: true })}
        ${'@cspell/dict-de-de'} | ${'data:,Hello%2C%20World%21'} | ${undefined}
    `('tryUrl $url $relativeTo', ({ url, relativeTo, expected }) => {
        expect(tryUrl(url, relativeTo)).toEqual(expected);
    });
});

function readConfig(filename: string): Config {
    const parsed = parse(fs.readFileSync(filename, 'utf-8'));
    if (!parsed || typeof parsed !== 'object') throw new Error(`Unable to parse "${filename}"`);
    return parsed as unknown as Config;
}

const rootURL = new URL('/', import.meta.url);

function u(url: string) {
    return new URL(url, rootURL);
}

function uh(url: string) {
    return u(url).href;
}
