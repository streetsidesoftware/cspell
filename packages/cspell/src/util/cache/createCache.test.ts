import * as path from 'path';
import { resolve as r } from 'path';

import type { CreateCacheSettings } from '.';
import type { CacheOptions } from './CacheOptions';
import { __testing__, calcCacheSettings, createCache } from './createCache';
import { DiskCache } from './DiskCache';
import { DummyCache } from './DummyCache';

jest.mock('./DiskCache');

const mockedDiskCache = jest.mocked(DiskCache);

const version = '5.20.0-alpha.192';

const U = undefined;
const T = true;
const F = false;

describe('Validate calcCacheSettings', () => {
    test.each`
        config                 | options                         | root             | expected                                | comment
        ${{}}                  | ${{}}                           | ${process.cwd()} | ${cco()}                                | ${''}
        ${{}}                  | ${{}}                           | ${__dirname}     | ${cco(F, r(__dirname, '.cspellcache'))} | ${''}
        ${{}}                  | ${{}}                           | ${'.'}           | ${cco()}                                | ${''}
        ${{}}                  | ${co()}                         | ${'.'}           | ${cco()}                                | ${''}
        ${{}}                  | ${co(U, '.')}                   | ${'.'}           | ${cco()}                                | ${'Location is a directory'}
        ${{}}                  | ${co(U, __filename)}            | ${'.'}           | ${cco(F, __filename)}                   | ${'Location is a file'}
        ${cs(T)}               | ${co()}                         | ${'.'}           | ${cco(T)}                               | ${'Use cache in config but not command-line'}
        ${cs(F)}               | ${co()}                         | ${'.'}           | ${cco(F)}                               | ${'cfg: true, cli: -'}
        ${cs(F)}               | ${co(T)}                        | ${'.'}           | ${cco(T)}                               | ${'cfg: false, cli: true'}
        ${{}}                  | ${co(T)}                        | ${'.'}           | ${cco(T)}                               | ${'cfg: -, cli: true'}
        ${{}}                  | ${{ cacheStrategy: 'content' }} | ${'.'}           | ${cco(F, U, 'content')}                 | ${'override default strategy'}
        ${{}}                  | ${co(T, U, 'content')}          | ${'.'}           | ${cco(T, U, 'content')}                 | ${'override strategy'}
        ${cs(U, U, 'content')} | ${co(T, U, 'metadata')}         | ${'.'}           | ${cco(T, U, 'metadata')}                | ${'override config strategy'}
        ${cs(T, U, 'content')} | ${{ version }}                  | ${'.'}           | ${cco(T, U, 'content')}                 | ${'override default strategy'}
    `('calcCacheSettings $comment - $config $options $root', async ({ config, options, root, expected }) => {
        if (!options.version) {
            options.version = version;
        }
        expect(await calcCacheSettings({ cache: config }, options, root)).toEqual(expected);
    });
});

describe('Validate createCache', () => {
    beforeEach(() => {
        mockedDiskCache.mockClear();
    });

    test.each`
        settings     | expectedToBeCalled
        ${cco()}     | ${F}
        ${cco(true)} | ${T}
    `('createCache $settings', ({ settings, expectedToBeCalled }) => {
        const dc = createCache(settings);
        expect(dc).toBeInstanceOf(expectedToBeCalled ? DiskCache : DummyCache);
        expect(mockedDiskCache).toHaveBeenCalledTimes(expectedToBeCalled ? 1 : 0);
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
    cacheStrategy: CreateCacheSettings['cacheStrategy'] = 'metadata',
    cacheFormat: CreateCacheSettings['cacheFormat'] = 'legacy'
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
    cacheFormat?: CacheOptions['cacheFormat']
) {
    return { useCache, cacheLocation, cacheStrategy, version, cacheFormat };
}

function co(
    cache?: boolean,
    cacheLocation?: string,
    cacheStrategy?: CacheOptions['cacheStrategy'],
    cacheFormat?: CacheOptions['cacheFormat']
) {
    return { cache, cacheLocation, cacheStrategy, version, cacheFormat };
}
