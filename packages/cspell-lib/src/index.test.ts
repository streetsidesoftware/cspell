import * as cspell from './index';

describe('Validate the cspell API', () => {
    test('Tests the default configuration', () => {
        const ext = '.json';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultBundledSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings).then((results) => {
            expect(Object.keys(results)).not.toHaveLength(0);
            expect(results.map((to) => to.text)).toEqual(expect.arrayContaining(['Jansons']));
            return;
        });
    });

    test('clearCachedFiles', async () => {
        await expect(cspell.clearCachedFiles()).resolves.not.toThrow();
    });

    test('Verify API exports', () => {
        expect(cspell).toMatchSnapshot();
    });
});
