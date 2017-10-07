import {expect} from 'chai';
import * as cspell from './index';

describe('Validate the cspell API', () => {
    it('Tests the default configuration', () => {
        const ext = '.json';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings)
            .then(results => {
                expect(results).to.not.be.empty;
                expect(results.map(to => to.text)).to.contain('Jansons');
            });
    });

    it('Tests suggestions', function() {
        this.timeout(5000);
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
