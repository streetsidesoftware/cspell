import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';

import { pathPackageSamplesURL } from '../../../../test-util/index.mjs';
import { resolveFileWithURL } from '../../../util/url.js';
import { defaultConfigFilenames as searchPlaces } from './configLoader.js';
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

            const searchFrom = 'file:///path/to/search/from/';

            const result = await configSearch.searchForConfig(searchFrom);

            expect(result).toBeUndefined();
        });

        test.each`
            dir                                              | expected
            ${sURL('src/')}                                  | ${sURL('.cspell.json')}
            ${sURL('linked/')}                               | ${sURL('linked/cspell.config.js')}
            ${'file:///path/to/search/from/'}                | ${undefined}
            ${'https:///path/to/search/from/'}               | ${undefined}
            ${new URL('https://example.com/path/to/files/')} | ${undefined}
            ${sURL('package-json/nested/README.md')}         | ${sURL('package-json/package.json')}
        `('searchForConfig $dir', async ({ dir, expected }) => {
            const configSearch = new ConfigSearch(searchPlaces);

            const searchFrom = dir;

            const result = await configSearch.searchForConfig(searchFrom);

            console.log('%o', { searchFrom, result, expected });

            expect(result?.href).toEqual(expected?.href);
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
