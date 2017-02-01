import { expect } from 'chai';
import { mergeSettings, readSettings } from './CSpellSettingsServer';
import * as path from 'path';

describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {})).to.be.deep.equal({
            enabled: undefined,
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {enabled: true})).to.be.deep.equal({
            enabled: true,
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {enabled: false})).to.be.deep.equal({
            enabled: false,
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({enabled: true}, {enabled: false})).to.be.deep.equal({
            enabled: false,
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });

    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', '..', 'server', 'sampleSourceFiles', 'cSpell.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
    });
});
