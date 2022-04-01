import * as DefaultSettings from './DefaultSettings';

describe('Validate Default Settings', () => {
    test('the static default settings', () => {
        const df = DefaultSettings._defaultSettings;
        expect(df.name).toBe('Static Defaults');
    });

    test('tests the default setting file is loaded', () => {
        const defaultSetting = DefaultSettings.getDefaultBundledSettings();
        expect(defaultSetting.name).toBe('cspell default settings');
    });

    test('default', () => {
        expect(DefaultSettings.getDefaultBundledSettings()).toEqual(DefaultSettings.getDefaultSettings(undefined));
    });
});
