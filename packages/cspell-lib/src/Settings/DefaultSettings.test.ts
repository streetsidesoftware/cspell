import * as DefaultSettings from './DefaultSettings';

describe('Validate Default Settings', () => {
    test('the static default settings', () => {
        const df = DefaultSettings._defaultSettings;
        expect(df.name).toBe('Static Defaults');
    });

    test('tests the default setting file is loaded', () => {
        const defaultSetting = DefaultSettings.getDefaultSettings();
        expect(defaultSetting.name).toBe('cspell default settings');
    });
});
