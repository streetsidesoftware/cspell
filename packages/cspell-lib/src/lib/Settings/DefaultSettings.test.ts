import { describe, expect, test } from 'vitest';

import * as DefaultSettings from './DefaultSettings.js';

describe('Validate Default Settings', () => {
    test('the static default settings', () => {
        const df = DefaultSettings._defaultSettings;
        expect(df.name).toBe('Static Defaults');
    });

    test('tests the default setting file is loaded', async () => {
        const defaultSetting = await DefaultSettings.getDefaultBundledSettingsAsync();
        expect(defaultSetting.name).toBe('cspell default settings');
    });

    test('default', async () => {
        expect(await DefaultSettings.getDefaultBundledSettingsAsync()).toEqual(
            await DefaultSettings.getDefaultSettings(undefined),
        );
    });
});
