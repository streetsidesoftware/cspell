import { describe, expect, test } from 'vitest';

import { pathPackageSamplesURL } from '../../../../test-util/index.mjs';
import { resolveFileWithURL, toURL } from '../../../util/url.js';
import { defaultConfigFilenames as searchPlaces } from './configLocations.js';
import { ConfigSearch } from './configSearch.js';

describe('ConfigSearch', () => {
    describe('searchForConfig', () => {
        test('should return the URL of the config file if found', async () => {
            const configSearch = new ConfigSearch(searchPlaces);

            const searchFrom = new URL('js-config/', pathPackageSamplesURL);
            const expectedConfigUrl = new URL('cspell.config.js', searchFrom);

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toEqual(expectedConfigUrl);
        });

        test('should return undefined if config file is not found', async () => {
            const configSearch = new ConfigSearch(searchPlaces);

            const searchFrom = u('/path/to/search/from/');

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toBeUndefined();
        });

        test.each`
            dir                                           | expected
            ${sURL('src/').href}                          | ${sURL('.cspell.json')}
            ${sURL('linked/').href}                       | ${sURL('linked/cspell.config.js')}
            ${sURL('linked').href}                        | ${sURL('.cspell.json')}
            ${u('/path/to/search/from/').href}            | ${undefined}
            ${'https://example.com/path/to/search/from/'} | ${undefined}
            ${'https://example.com/path/to/files/'}       | ${undefined}
            ${sURL('package-json/nested/README.md').href} | ${sURL('package-json/package.json')}
        `('searchForConfig $dir', async ({ dir, expected }) => {
            const configSearch = new ConfigSearch(searchPlaces);

            const searchFrom = toURL(dir);

            const result = await configSearch.searchForConfig(searchFrom);

            // console.log('%o', { searchFrom, result, expected });

            expect(result?.href).toEqual(expected?.href);
        });

        test('that the same result is returned', async () => {
            const configSearch = new ConfigSearch(searchPlaces);
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
            const configSearch = new ConfigSearch(searchPlaces);

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

function sURL(filename: string): URL {
    return resolveFileWithURL(filename, pathPackageSamplesURL);
}

const rootURL = new URL('/', import.meta.url);

function u(url: string) {
    return new URL(url, rootURL);
}
