import {expect} from 'chai';
import * as cspell from '../index';

describe('Validate English', function() {
    it('Tests suggestions', function() {
        this.timeout(30000);

        const ext = '.txt';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        const finalSettings = cspell.finalizeSettings(fileSettings);
        const dict = cspell.getDictionary(finalSettings);

        // cspell:ignore installsallnecessary
        return dict.then(dict => {
            const results = dict.suggest('installsallnecessary', 5, cspell.CompoundWordsMethod.SEPARATE_WORDS, 2);
            const sugs = results.map(a => a.word);
            expect(sugs).to.contain('installs all necessary');
        });
    });
});
