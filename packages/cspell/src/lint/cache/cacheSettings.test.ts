import * as path from 'node:path';
import { resolve as r } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import type { CacheOptions } from '../../options.js';
import type { CreateCacheSettings } from '../../util/cache/index.js';
import { __testing__, calcCacheSettings } from './cacheSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const version = '5.20.0-alpha.192';

const U = undefined;
const T = true;
const F = false;

describe('Validate calcCacheSettings', () => {
    test.each`
        config                  | options                          | root             | expected                                | comment
        ${U}                    | ${{}}                            | ${'.'}           | ${cco()}                                | ${'No cache settings'}
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
        ${cs(T, U, 'metadata')} | ${{}}                            | ${'.'}           | ${cco(T, U, 'metadata')}                | ${'override default strategy'}
    `('calcCacheSettings $comment - $config $options $root', async ({ config, options, root, expected }) => {
        expect(await calcCacheSettings({ cache: config }, options, root, version)).toEqual(expected);
    });

    test('calcCacheSettings includes the context tag only when set', async () => {
        expect(await calcCacheSettings({}, { languageId: 'markdown' }, '.', version)).toEqual(
            expect.objectContaining({ contextTag: '{"languageId":"markdown"}' }),
        );
        expect(await calcCacheSettings({}, {}, '.', version)).not.toHaveProperty('contextTag');
    });

    test.each`
        noConfigSearch | configSearch | expected
        ${undefined}   | ${undefined} | ${undefined}
        ${false}       | ${undefined} | ${undefined}
        ${true}        | ${undefined} | ${'{"configSearch":false}'}
        ${undefined}   | ${false}     | ${undefined}
    `(
        'calcCacheSettings keys on whether the run searches for config files: $noConfigSearch $configSearch',
        async ({ noConfigSearch, configSearch, expected }) => {
            const settings = await calcCacheSettings({ noConfigSearch }, { configSearch }, '.', version);
            expect(settings.contextTag).toBe(expected);
        },
    );

    test.each`
        loadDefaultConfiguration | defaultConfiguration | expected
        ${undefined}             | ${undefined}         | ${undefined}
        ${true}                  | ${undefined}         | ${undefined}
        ${false}                 | ${undefined}         | ${'{"defaultConfiguration":false}'}
        ${undefined}             | ${false}             | ${undefined}
    `(
        'calcCacheSettings keys on whether the run loads the default configuration: $loadDefaultConfiguration $defaultConfiguration',
        async ({ loadDefaultConfiguration, defaultConfiguration, expected }) => {
            const settings = await calcCacheSettings(
                { loadDefaultConfiguration },
                { defaultConfiguration },
                '.',
                version,
            );
            expect(settings.contextTag).toBe(expected);
        },
    );
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
    return { useCache, cacheLocation, cacheStrategy, version: '5.20', cacheFormat };
}

function cs(
    useCache?: boolean,
    cacheLocation?: string,
    cacheStrategy?: CacheOptions['cacheStrategy'],
    cacheFormat?: CacheOptions['cacheFormat'],
) {
    return { useCache, cacheLocation, cacheStrategy, cacheFormat };
}

function co(
    cache?: boolean,
    cacheLocation?: string,
    cacheStrategy?: CacheOptions['cacheStrategy'],
    cacheFormat?: CacheOptions['cacheFormat'],
) {
    return { cache, cacheLocation, cacheStrategy, cacheFormat };
}
