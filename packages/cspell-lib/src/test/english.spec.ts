import * as cspell from '../index';
import { validateText } from '../validator';

describe('Validate English', () => {
    jest.setTimeout(10000);
    test('Tests suggestions', () => {
        const ext = '.txt';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        const finalSettings = cspell.finalizeSettings(fileSettings);
        const dict = cspell.getDictionary(finalSettings);

        // cspell:ignore installsallnecessary
        return dict.then((dict) => {
            const results = dict.suggest('installsallnecessary', 5, cspell.CompoundWordsMethod.SEPARATE_WORDS, 2);
            const sugs = results.map((a) => a.word);
            expect(sugs).toEqual(expect.arrayContaining(['installs all necessary']));
            return;
        });
    });

    test('validate some text', async () => {
        const ext = '.txt';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = { ...cspell.getDefaultSettings(), words: ['é', 'î'] };
        const text = `
        Here are some words.
        thing and cpp are words.
        é'thing and î'cpp are ok.
        `;

        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        const finalSettings = cspell.finalizeSettings(fileSettings);

        const r = await validateText(text, finalSettings);
        expect(r).toEqual([]);
    });
});
