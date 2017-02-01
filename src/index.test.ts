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
});
