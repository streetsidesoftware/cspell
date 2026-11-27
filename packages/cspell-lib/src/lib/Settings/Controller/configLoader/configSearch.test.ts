import { promises as nfs } from 'node:fs';

import { createRedirectProvider, createVirtualFS, FSCapabilityFlags } from 'cspell-io';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { pathPackageSamplesURL, pathRepoTestFixturesURL } from '../../../../test-util/index.mjs';
import { getVirtualFS } from '../../../fileSystem.js';
import { resolveFileWithURL, toURL } from '../../../util/url.js';
import { defaultConfigFilenames as searchPlaces } from './configLocations.js';
import type { StopAtLocation } from './configSearch.js';
import { ConfigSearch } from './configSearch.js';

const virtualURL = new URL('virtual-fs://github/cspell-io/');
const htmlURL = new URL('https://example.com/');
const issuesURL = new URL('issues/', pathRepoTestFixturesURL);

const defaultExtensions = ['.json', '.yaml', '.yml', '.jsonc'];
const allExtensions = [...defaultExtensions, '.js', '.cjs', '.mjs'];

const allowedExtensionsByProtocol = new Map<string, readonly string[]>([
    ['file:', allExtensions],
    ['virtual-fs:', allExtensions],
    ['*', defaultExtensions],
]);

describe('ConfigSearch', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('searchForConfig', () => {
        test('should return the URL of the config file if found', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);

            const searchFrom = new URL('js-config/', pathPackageSamplesURL);
            const expectedConfigUrl = new URL('cspell.config.js', searchFrom);

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toEqual(expectedConfigUrl);
        });

        test('should return undefined if config file is not found', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);

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
            ${uh('linked/', htmlURL)}                     | ${u('.cspell.json', htmlURL)}
            ${uh('linked', htmlURL)}                      | ${u('.cspell.json', htmlURL)}
            ${uh('/path/to/search/from/')}                | ${undefined}
            ${'https://example.com/path/to/search/from/'} | ${u('.cspell.json', htmlURL)}
            ${'https://example.com/path/to/files/'}       | ${u('.cspell.json', htmlURL)}
            ${sURLh('package-json/nested/README.md')}     | ${sURL('package-json/package.json')}
            ${uh('issue-5120/', issuesURL)}               | ${u('issue-5120/.config/cspell.config.yaml', issuesURL)}
        `('searchForConfig vfs $dir', async ({ dir, expected }) => {
            const vfs = createVirtualFS();
            const redirectProviderVirtual = createRedirectProvider('virtual', virtualURL, sURL('./'));
            const redirectProviderHtml = createRedirectProvider('html', htmlURL, sURL('./'), {
                // Do not allow directory reads.
                capabilities: ~FSCapabilityFlags.ReadWriteDir,
            });
            vfs.registerFileSystemProvider(redirectProviderVirtual, redirectProviderHtml);
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, vfs.fs);

            const searchFrom = toURL(dir);

            const result = await configSearch.searchForConfig(searchFrom);

            // console.log('%o', { searchFrom, result, expected });

            expect(result?.href).toEqual(expected?.href);
        });

        test('that the same result is returned', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
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

        test('that results found with different stop directories are kept apart', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
            const searchFrom = sURL('src/');
            const expected = sURL('.cspell.json');

            expect(await configSearch.searchForConfig(searchFrom)).toEqual(expected);
            expect(await configSearch.searchForConfig(searchFrom, [searchFrom])).toBeUndefined();
            expect(await configSearch.searchForConfig(searchFrom)).toEqual(expected);
        });

        test('that an exclusive stop is not searched', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
            const stopDir = sURL('./');
            const searchFrom = sURL('src/');
            const expected = sURL('.cspell.json');
            const exclusive = { url: stopDir, exclusive: true };

            expect(await configSearch.searchForConfig(searchFrom, [stopDir])).toEqual(expected);
            expect(await configSearch.searchForConfig(searchFrom, [{ url: stopDir }])).toEqual(expected);
            expect(await configSearch.searchForConfig(searchFrom, [exclusive])).toBeUndefined();
            expect(await configSearch.searchForConfig(stopDir, [exclusive])).toBeUndefined();
            expect(await configSearch.searchForConfig(searchFrom, [stopDir])).toEqual(expected);
        });

        test('that a stop list is only read the first time it is given', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
            const stopDir = sURL('./');
            const expected = sURL('.cspell.json');
            let reads = 0;
            const stop: StopAtLocation = {
                get url() {
                    ++reads;
                    return stopDir;
                },
            };
            const stops = [stop];

            expect(await configSearch.searchForConfig(sURL('src/'), stops)).toEqual(expected);
            expect(reads).toBe(1);
            expect(await configSearch.searchForConfig(sURL('src/nested/'), stops)).toEqual(expected);
            expect(reads).toBe(1);
        });

        test('that lists with the same stops share their results', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
            const findUp = vi.spyOn(getVirtualFS().fs, 'findUp');
            const stopDir = sURL('./');
            const searchFrom = sURL('src/');
            const expected = sURL('.cspell.json');

            expect(await configSearch.searchForConfig(searchFrom, [stopDir])).toEqual(expected);
            expect(await configSearch.searchForConfig(searchFrom, [stopDir])).toEqual(expected);
            expect(await configSearch.searchForConfig(searchFrom, [{ url: stopDir }])).toEqual(expected);
            expect(findUp).toHaveBeenCalledTimes(1);
            expect(await configSearch.searchForConfig(searchFrom, [{ url: stopDir, exclusive: true }])).toBeUndefined();
            expect(await configSearch.searchForConfig(searchFrom, [{ url: stopDir, exclusive: true }])).toBeUndefined();
            expect(findUp).toHaveBeenCalledTimes(2);
        });

        test('symbolic links', async () => {
            const dir = new URL('issues/issue-5120/', pathRepoTestFixturesURL);
            const info = await nfs.readdir(dir, { withFileTypes: true });
            const symEntries = info.filter((e) => e.isSymbolicLink());
            expect(symEntries.map((e) => e.name)).toEqual(['.config']);
        });
    });

    describe('clearCache', () => {
        test('should clear the search cache', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);

            const searchFrom = new URL('js-config/', pathPackageSamplesURL);
            const expectedConfigUrl = new URL('cspell.config.js', searchFrom);

            const result = await configSearch.searchForConfig(searchFrom);
            expect(result).toEqual(expectedConfigUrl);
            const result2 = await configSearch.searchForConfig(new URL('text.txt', searchFrom));
            expect(result2).toBe(result);

            configSearch.clearCache();
            const result3 = await configSearch.searchForConfig(searchFrom);
            expect(result3).toEqual(expectedConfigUrl);
            expect(result3).not.toBe(result);
        });

        test('should clear the results found with stops', async () => {
            const configSearch = new ConfigSearch(searchPlaces, allowedExtensionsByProtocol, getVirtualFS().fs);
            const searchFrom = sURL('src/');
            const stops = [sURL('./')];

            const result = await configSearch.searchForConfig(searchFrom, stops);
            expect(result).toEqual(sURL('.cspell.json'));
            expect(await configSearch.searchForConfig(searchFrom, stops)).toBe(result);

            configSearch.clearCache();
            const result2 = await configSearch.searchForConfig(searchFrom, stops);
            expect(result2).toEqual(result);
            expect(result2).not.toBe(result);
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
