import {expect} from 'chai';
import * as cspell from '../index';

describe('Validate English', function() {
    this.timeout(30000);
    it('Tests suggestions', function() {
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
            const results = dict.suggest('installsallnecessary', 10, cspell.CompoundWordsMethod.SEPARATE_WORDS);
            const sugs = results.map(a => a.word);
            expect(sugs).to.contain('installs all necessary');
        });
    });
});
