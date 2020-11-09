import * as cspell from './index';

describe('Validate the cspell API', () => {
    test('Tests the default configuration', () => {
        const ext = '.json';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings).then((results) => {
            expect(results.map((to) => to.text)).toContain('Jansons');
        });
    });

    test('clearCachedSettings', () => {
        return expect(cspell.clearCachedFiles()).resolves.not.toThrow();
    });
});
