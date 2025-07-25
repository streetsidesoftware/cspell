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

    test('should be remote', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile.remote).toBe(true);
    });

    test('should be virtual', () => {
        const configFile = new CSpellConfigFileInMemory(url, settings);
        expect(configFile.virtual).toBe(true);
    });

    test('from', () => {
        const cfg = new CSpellConfigFileInMemory(url, settings);
        const cfgFrom = CSpellConfigFileInMemory.from(url, settings);
        expect(cfgFrom.settings).toEqual(cfg.settings);
        expect(cfgFrom.url).toEqual(cfg.url);
    });
});
