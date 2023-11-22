import type { CSpellSettings } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { CSpellConfigFileInMemory } from './CSpellConfigFileInMemory.js';

describe('CSpellConfigFileInMemory', () => {
    const url = new URL('https://example.com/config');
    const settings: CSpellSettings = {};

    test('should create an instance of CSpellConfigFileInMemory', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile).toBeInstanceOf(CSpellConfigFileInMemory);
    });

    test('should have the correct URL', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile.url).toEqual(url);
    });

    test('should have the correct settings', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile.settings).toEqual(settings);
    });

    test('should be readonly', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile.readonly).toBe(true);
    });
});
