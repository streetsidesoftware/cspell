import * as path from 'node:path';
import { resolve as r } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import type { CacheOptions } from './CacheOptions.js';
import type { CreateCacheSettings } from './createCache.js';
import { __testing__, calcCacheSettings, createCache } from './createCache.js';
import { DiskCache } from './DiskCache.js';
import { DummyCache } from './DummyCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const version = '5.20.0-alpha.192';

const U = undefined;
const T = true;
const F = false;

describe('calcOptionsKey', () => {
    const { calcOptionsKey } = __testing__;

    test.each`
        options                                                 | expected
        ${{}}                                                   | ${undefined}
        ${{ languageId: '', locale: '' }}                       | ${undefined}
        ${{ languageId: 'markdown' }}                           | ${'{"languageId":"markdown"}'}
        ${{ locale: 'fr' }}                                     | ${'{"locale":"fr"}'}
        ${{ report: 'flagged' }}                                | ${'{"report":"flagged"}'}
        ${{ showSuggestions: false }}                           | ${'{"showSuggestions":false}'}
        ${{ validateDirectives: true }}                         | ${'{"validateDirectives":true}'}
        ${{ validateDirectives: true, languageId: 'markdown' }} | ${'{"languageId":"markdown","validateDirectives":true}'}
        ${{ stopConfigSearchAt: [] }}                           | ${undefined}
        ${{ stopConfigSearchAt: stops('.') }}                   | ${'{"stopConfigSearchAt":["."]}'}
        ${{ stopConfigSearchAt: stops('src', '..') }}           | ${'{"stopConfigSearchAt":["..","src"]}'}
        ${{ stopConfigSearchAt: stops('src/a/b') }}             | ${'{"stopConfigSearchAt":["src/a/b"]}'}
    `('calcOptionsKey $options', ({ options, expected }) => {
        expect(calcOptionsKey(options, process.cwd(), true)).toBe(expected);
    });

    test.each`
        config                        | expected
        ${'cspell.custom.json'}       | ${'{"config":"cspell.custom.json"}'}
        ${'packages/foo/cspell.json'} | ${'{"config":"packages/foo/cspell.json"}'}
        ${'../cspell.json'}           | ${'{"config":"../cspell.json"}'}
    `('calcOptionsKey names the config relative to the root: $config', ({ config, expected }) => {
        const root = process.cwd();
        const configUrl = pathToFileURL(path.resolve(root, config));
        expect(calcOptionsKey({ configUrl }, root, true)).toBe(expected);
    });

    test('calcOptionsKey keeps the URL of a config that is not a file', () => {
        const configUrl = new URL('https://example.com/cspell.json');
        expect(calcOptionsKey({ configUrl }, process.cwd(), true)).toBe('{"config":"https://example.com/cspell.json"}');
    });

    test.each`
        configSearch | expected
        ${true}      | ${undefined}
        ${false}     | ${'{"configSearch":false}'}
    `('calcOptionsKey records only a run that does not search: $configSearch', ({ configSearch, expected }) => {
        expect(calcOptionsKey({}, process.cwd(), configSearch)).toBe(expected);
    });

    test.each`
        noConfigSearch | expected
        ${undefined}   | ${undefined}
        ${false}       | ${undefined}
        ${true}        | ${'{"configSearch":false}'}
    `('calcCacheSettings keys on the noConfigSearch setting: $noConfigSearch', async ({ noConfigSearch, expected }) => {
        const settings = await calcCacheSettings({ noConfigSearch }, { version }, '.');
        expect(settings.optionsKey).toBe(expected);
    });

    test('calcCacheSettings includes the options only when set', async () => {
        expect(await calcCacheSettings({}, { version, languageId: 'markdown' }, '.')).toEqual(
            expect.objectContaining({ optionsKey: '{"languageId":"markdown"}' }),
        );
        expect(await calcCacheSettings({}, { version }, '.')).not.toHaveProperty('optionsKey');
    });
});

describe('Validate calcCacheSettings', () => {
    test.each`
        config                  | options                          | root             | expected                                | comment
        ${{}}                   | ${{}}                            | ${process.cwd()} | ${cco()}                                | ${''}
        ${{}}                   | ${{}}                            | ${__dirname}     | ${cco(F, r(__dirname, '.cspellcache'))} | ${''}
        ${{}}                   | ${{}}                            | ${'.'}           | ${cco()}                                | ${''}
        ${{}}                   | ${co()}                          | ${'.'}           | ${cco()}                                | ${''}
        ${{}}                   | ${co(U, '.')}                    | ${'.'}           | ${cco()}                                | ${'Location is a directory'}
        ${{}}                   | ${co(U, __filename)}             | ${'.'}           | ${cco(F, __filename)}                   | ${'Location is a file'}
        ${cs(T)}                | ${co()}                          | ${'.'}           | ${cco(T)}                               | ${'Use cache in config but not command-line'}
        ${cs(F)}                | ${co()}                          | ${'.'}           | ${cco(F)}                               | ${'cfg: true, cli: -'}
        ${cs(F)}                | ${co(T)}                         | ${'.'}           | ${cco(T)}                               | ${'cfg: false, cli: true'}
        ${{}}                   | ${co(T)}                         | ${'.'}           | ${cco(T)}                               | ${'cfg: -, cli: true'}
        ${{}}                   | ${{ cacheStrategy: 'metadata' }} | ${'.'}           | ${cco(F, U, 'metadata')}                | ${'override default strategy'}
        ${{}}                   | ${co(T, U, 'metadata')}          | ${'.'}           | ${cco(T, U, 'metadata')}                | ${'override strategy'}
        ${cs(U, U, 'metadata')} | ${co(T, U, 'content')}           | ${'.'}           | ${cco(T, U, 'content')}                 | ${'override config strategy'}
        ${cs(T, U, 'metadata')} | ${{ version }}                   | ${'.'}           | ${cco(T, U, 'metadata')}                | ${'override default strategy'}
    `('calcCacheSettings $comment - $config $options $root', async ({ config, options, root, expected }) => {
        if (!options.version) {
            options.version = version;
        }
        expect(await calcCacheSettings({ cache: config }, options, root)).toEqual(expected);
    });
});

describe('Validate createCache', () => {
    test.each`
        settings     | expectedToBeCalled
        ${cco()}     | ${F}
        ${cco(true)} | ${T}
    `('createCache $settings', async ({ settings, expectedToBeCalled }) => {
        const dc = await createCache(settings);
        expect(dc).toBeInstanceOf(expectedToBeCalled ? DiskCache : DummyCache);
    });
});

describe('validate normalizeVersion', () => {
    test.each`
        version              | expected
        ${'5.8'}             | ${'5.8'}
        ${'5.8.30'}          | ${'5.8'}
        ${'5.8.30-alpha.2'}  | ${'5.8'}
        ${'5.28.30-alpha.2'} | ${'5.28'}
        ${'6.0.30-alpha.2'}  | ${'6.0'}
    `('normalizeVersion $version', ({ version, expected }) => {
        expect(__testing__.normalizeVersion(version)).toBe(expected + __testing__.versionSuffix);
    });
    test.each`
        version
        ${'5'}
        ${''}
    `('normalizeVersion bad "$version"', ({ version }) => {
        expect(() => __testing__.normalizeVersion(version)).toThrow();
    });
});

/**
 * CreateCacheSettings
 */
function cco(
    useCache = false,
    cacheLocation = '.cspellcache',
    cacheStrategy: CreateCacheSettings['cacheStrategy'] = 'content',
    cacheFormat: CreateCacheSettings['cacheFormat'] = 'universal',
): CreateCacheSettings {
    if (cacheLocation) {
        cacheLocation = path.resolve(process.cwd(), cacheLocation);
    }
    return { useCache, cacheLocation, cacheStrategy, version, cacheFormat };
}

function cs(
    useCache?: boolean,
    cacheLocation?: string,
    cacheStrategy?: CacheOptions['cacheStrategy'],
    cacheFormat?: CacheOptions['cacheFormat'],
) {
    return { useCache, cacheLocation, cacheStrategy, version, cacheFormat };
}

function co(
    cache?: boolean,
    cacheLocation?: string,
    cacheStrategy?: CacheOptions['cacheStrategy'],
    cacheFormat?: CacheOptions['cacheFormat'],
) {
    return { cache, cacheLocation, cacheStrategy, version, cacheFormat };
}

function stops(...folders: string[]): URL[] {
    return folders.map((folder) => pathToFileURL(path.resolve(folder) + path.sep));
}
