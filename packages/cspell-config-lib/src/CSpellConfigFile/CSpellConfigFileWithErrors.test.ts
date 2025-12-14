import type { CSpellSettings } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { CSpellConfigFileWithErrors } from './CSpellConfigFileWithErrors.js';

describe('CSpellConfigFileWithErrors', () => {
    const url = new URL('https://example.com/config');
    const settings: CSpellSettings = {};
    const error = new Error('Test error');

    test('should create an instance of CSpellConfigFileWithErrors', () => {
        const configFile = new CSpellConfigFileWithErrors(url, settings, error);
        expect(configFile).toBeInstanceOf(CSpellConfigFileWithErrors);
    });

    test('should have the correct URL', () => {
        const configFile = new CSpellConfigFileWithErrors(url, settings, error);
        expect(configFile.url).toEqual(url);
    });

    test('should have the correct settings', () => {
        const configFile = new CSpellConfigFileWithErrors(url, settings, error);
        expect(configFile.settings).toEqual(settings);
    });

    test('should be readonly', () => {
        const configFile = new CSpellConfigFileWithErrors(url, settings, error);
        expect(configFile.readonly).toBe(true);
    });
});
