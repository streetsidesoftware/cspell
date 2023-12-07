import type { CSpellSettings } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { CSpellConfigFileJavaScript } from './CSpellConfigFileJavaScript.js';

describe('CSpellConfigFileJavaScript', () => {
    const url = new URL('https://example.com/config');
    const settings: CSpellSettings = {};

    test('should create an instance of CSpellConfigFileInMemory', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile).toBeInstanceOf(CSpellConfigFileJavaScript);
    });

    test('should have the correct URL', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile.url).toEqual(url);
    });

    test('should have the correct settings', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile.settings).toEqual(settings);
    });

    test('should be readonly', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile.readonly).toBe(true);
    });

    test('should NOT be remote', () => {
        const configFile = new CSpellConfigFileJavaScript(new URL(import.meta.url), settings);
        expect(configFile.remote).toBe(false);
    });

    test('should be remote', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile.remote).toBe(true);
    });

    test('should NOT be virtual', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(configFile.virtual).toBe(false);
    });

    test('should throw when adding words', () => {
        const configFile = new CSpellConfigFileJavaScript(url, settings);
        expect(() => configFile.addWords(['word'])).toThrowError('Unable to add words to a JavaScript config file.');
    });
});
