import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import type { CreateCacheSettings } from './createCache.js';
import { createCache } from './createCache.js';
import { DiskCache } from './DiskCache.js';
import { DummyCache } from './DummyCache.js';

describe('Validate createCache', () => {
    test.each`
        settings     | expectedToBeCalled
        ${cco()}     | ${false}
        ${cco(true)} | ${true}
    `('createCache $settings', async ({ settings, expectedToBeCalled }) => {
        const dc = await createCache(settings);
        expect(dc).toBeInstanceOf(expectedToBeCalled ? DiskCache : DummyCache);
    });
});

function cco(useCache = false): CreateCacheSettings {
    const cacheLocation = path.resolve(process.cwd(), '.cspellcache');
    return { useCache, cacheLocation, cacheStrategy: 'content', version: '5.20', cacheFormat: 'universal' };
}
