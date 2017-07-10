import { expect } from 'chai';
import { mergeSettings, readSettings, getGlobalSettings } from './CSpellSettingsServer';
import { getDefaultSettings } from './DefaultSettings';
import * as path from 'path';

describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {})).to.be.deep.equal({
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

    it('tests loading a missing cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-missing.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.not.include('import');
    });

    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-import.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.include('import');
    });

    it('tests loading a cSpell.json with multiple imports file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-imports.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.include('import');
        expect(settings.words).to.include('imports');
        // cspell:word leuk
        expect(settings.words).to.include('leuk');
    });

    it('makes sure global settings is an object', () => {
        const settings = getGlobalSettings();
        expect(settings).to.not.be.empty;
        const merged = mergeSettings(getDefaultSettings(), getGlobalSettings());
        expect(merged).to.not.be.empty;
    });
});
