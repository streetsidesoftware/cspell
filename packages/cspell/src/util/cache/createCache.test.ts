import { calcCacheSettings, createCache } from './createCache';
import { DiskCache } from './DiskCache';
import { CacheOptions } from './CacheOptions';
import * as path from 'path';
import { resolve as r } from 'path';
import { CreateCacheSettings } from '.';
import { DummyCache } from './DummyCache';

jest.mock('./DiskCache');

const mockedDiskCache = jest.mocked(DiskCache);

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
        ${cs(T, U, 'content')} | ${{}}                           | ${'.'}           | ${cco(T, U, 'content')}                 | ${'override default strategy'}
    `('calcCacheSettings $comment - $config $options $root', async ({ config, options, root, expected }) => {
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

/**
 * CreateCacheSettings
 */
function cco(
    useCache = false,
    cacheLocation = '.cspellcache',
    cacheStrategy: CreateCacheSettings['cacheStrategy'] = 'metadata'
): CreateCacheSettings {
    if (cacheLocation) {
        cacheLocation = path.resolve(process.cwd(), cacheLocation);
    }
    return { useCache, cacheLocation, cacheStrategy };
}

function cs(useCache?: boolean, cacheLocation?: string, cacheStrategy?: CacheOptions['cacheStrategy']) {
    return { useCache, cacheLocation, cacheStrategy };
}

function co(cache?: boolean, cacheLocation?: string, cacheStrategy?: CacheOptions['cacheStrategy']) {
    return { cache, cacheLocation, cacheStrategy };
}
