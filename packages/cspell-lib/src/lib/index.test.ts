import { describe, expect, test } from 'vitest';

import * as cspell from './index.js';

describe('Validate the cspell API', () => {
    test('Tests the default configuration', async () => {
        const ext = '.json';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = await cspell.getDefaultBundledSettingsAsync();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings).then((results) => {
            expect(Object.keys(results)).not.toHaveLength(0);
            expect(results.map((to) => to.text)).toEqual(expect.arrayContaining(['Jansons']));
            return;
        });
    });

    test('Verify API exports', () => {
        expect(cspell).toMatchSnapshot();
    });
});
