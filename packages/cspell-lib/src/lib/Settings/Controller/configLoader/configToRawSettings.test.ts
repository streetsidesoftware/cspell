import { fileURLToPath } from 'node:url';

import { CSpellConfigFileJavaScript } from 'cspell-config-lib';
import { describe, expect, test } from 'vitest';

import { configToRawSettings } from './configToRawSettings.js';

describe('configToRawSettings', () => {
    test('should return empty settings when config file is undefined', () => {
        const result = configToRawSettings(undefined);
        expect(result).toEqual({});
    });

    test('should convert CSpellConfigFile to CSpellSettingsWST', () => {
        const cfgFile = new CSpellConfigFileJavaScript(new URL(import.meta.url), {});
        const result = configToRawSettings(cfgFile);
        expect(result.__importRef).toEqual(expect.objectContaining({ filename: fileURLToPath(import.meta.url) }));
    });
});
