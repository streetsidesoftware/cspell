import { describe, expect, test } from 'vitest';

import { getDefaultConfigLoader, resolveConfigFileImports } from './defaultConfigLoader.js';

describe('defaultConfigLoader', () => {
    test('getDefaultConfigLoader', () => {
        expect(getDefaultConfigLoader()).toEqual(expect.any(Object));
    });

    test('resolveConfigFileImports', async () => {
        const configFile = {
            url: new URL('cspell.json', import.meta.url),
            settings: {
                words: ['one'],
            },
        };
        expect(await resolveConfigFileImports(configFile)).toEqual(expect.objectContaining({ words: ['one'] }));
    });
});
