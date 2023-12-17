import { createRedirectProvider, createVirtualFS, FSCapabilityFlags } from 'cspell-io';
import { describe, expect, test } from 'vitest';

import { pathPackageSamplesURL } from '../../../../test-util/index.mjs';
import { getVirtualFS } from '../../../fileSystem.js';
import { resolveFileWithURL, toURL } from '../../../util/url.js';
import { defaultConfigFilenames as searchPlaces } from './configLocations.js';
import { ConfigSearch } from './configSearch.js';

const virtualURL = new URL('virtual-fs://github/cspell-io/');
const htmlURL = new URL('https://example.com/');

describe('ConfigSearch', () => {
    describe('searchForConfig', () => {
        test('should return the URL of the config file if found', async () => {
            const configSearch = new ConfigSearch(searchPlaces, getVirtualFS().fs);

            const searchFrom = new URL('js-config/', pathPackageSamplesURL);
            const expectedConfigUrl = new URL('cspell.config.js', searchFrom);

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toEqual(expectedConfigUrl);
        });

        test('should return undefined if config file is not found', async () => {
            const configSearch = new ConfigSearch(searchPlaces, getVirtualFS().fs);

            const searchFrom = u('/path/to/search/from/');

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toBeUndefined();
        });

        test.each`
            dir                                           | expected
            ${sURLh('src/')}                              | ${sURL('.cspell.json')}
            ${sURLh('linked/')}                           | ${sURL('linked/cspell.config.js')}
            ${sURLh('linked')}                            | ${sURL('.cspell.json')}
            ${vURLh('src/')}                              | ${vURL('.cspell.json')}
            ${vURLh('linked/')}                           | ${vURL('linked/cspell.config.js')}
            ${vURLh('linked')}                            | ${vURL('.cspell.json')}
            ${uh('src/', htmlURL)}                        | ${u('.cspell.json', htmlURL)}
            ${uh('linked/', htmlURL)}                     | ${u('linked/cspell.config.js', htmlURL)}
            ${uh('linked', htmlURL)}                      | ${u('.cspell.json', htmlURL)}
            ${uh('/path/to/search/from/')}                | ${undefined}
            ${'https://example.com/path/to/search/from/'} | ${u('.cspell.json', htmlURL)}
            ${'https://example.com/path/to/files/'}       | ${u('.cspell.json', htmlURL)}
            ${sURLh('package-json/nested/README.md')}     | ${sURL('package-json/package.json')}
        `('searchForConfig vfs $dir', async ({ dir, expected }) => {
            const vfs = createVirtualFS();
            const redirectProviderVirtual = createRedirectProvider('virtual', virtualURL, sURL('./'));
            const redirectProviderHtml = createRedirectProvider('html', htmlURL, sURL('./'), {
                // Do not allow directory reads.
                capabilities: ~FSCapabilityFlags.ReadWriteDir,
            });
            vfs.registerFileSystemProvider(redirectProviderVirtual, redirectProviderHtml);
            const configSearch = new ConfigSearch(searchPlaces, vfs.fs);

            const searchFrom = toURL(dir);

            const result = await configSearch.searchForConfig(searchFrom);

            // console.log('%o', { searchFrom, result, expected });

            expect(result?.href).toEqual(expected?.href);
        });

        test('that the same result is returned', async () => {
            const configSearch = new ConfigSearch(searchPlaces, getVirtualFS().fs);
            const result = await configSearch.searchForConfig(sURL('src/'));
            const result2 = await configSearch.searchForConfig(sURL('.'));
            expect(result2).toBe(result);
            configSearch.clearCache();
            const result3 = await configSearch.searchForConfig(sURL('.'));
            const result4 = await configSearch.searchForConfig(sURL('src/nested/dir/'));
            const result5 = await configSearch.searchForConfig(sURL('src'));
            expect(result3).toStrictEqual(result);
            expect(result4).toStrictEqual(result);
            expect(result3).not.toBe(result);
            expect(result4).toBe(result3);
            expect(result5).toStrictEqual(result4);
        });
    });

    describe('clearCache', () => {
        test('should clear the search cache', async () => {
            const configSearch = new ConfigSearch(searchPlaces, getVirtualFS().fs);

            const searchFrom = new URL('js-config/', pathPackageSamplesURL);
            const expectedConfigUrl = new URL('cspell.config.js', searchFrom);

            const result = await configSearch.searchForConfig(searchFrom);
            expect(result).toEqual(expectedConfigUrl);
            const result2 = await configSearch.searchForConfig(new URL('./text.txt', searchFrom));
            expect(result2).toBe(result);

            configSearch.clearCache();
            const result3 = await configSearch.searchForConfig(searchFrom);
            expect(result3).toEqual(expectedConfigUrl);
            expect(result3).not.toBe(result);
        });
    });
});

function vURL(url: string): URL {
    return u(url, virtualURL);
}

function vURLh(url: string): string {
    return vURL(url).href;
}

function sURL(filename: string): URL {
    return resolveFileWithURL(filename, pathPackageSamplesURL);
}

function sURLh(filename: string): string {
    return sURL(filename).href;
}

const rootURL = new URL('/', import.meta.url);

function u(url: string, baseURL = rootURL) {
    return new URL(url, baseURL);
}

function uh(url: string, baseURL = rootURL) {
    return u(url, baseURL).href;
}
