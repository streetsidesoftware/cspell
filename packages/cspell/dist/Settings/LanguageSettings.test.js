"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const LanguageSettings_1 = require("./LanguageSettings");
const CSpellSettingsServer_1 = require("./CSpellSettingsServer");
const DefaultSettings_1 = require("./DefaultSettings");
const CSpellSettingsServer_2 = require("./CSpellSettingsServer");
const LS = require("./LanguageSettings");
const extraSettings = {
    ignoreRegExpList: ['binary'],
    languageSettings: [
        {
            languageId: 'python',
            patterns: [{ name: 'special', pattern: 'special' }],
            ignoreRegExpList: [
                'special'
            ],
        }
    ],
};
const defaultSettings = DefaultSettings_1.getDefaultSettings();
const defaultLanguageSettings = defaultSettings.languageSettings;
describe('Validate LanguageSettings', () => {
    it('tests merging language settings', () => {
        const defaultSettings = DefaultSettings_1.getDefaultSettings();
        const languageSettings = defaultSettings.languageSettings || [];
        const sPython = LanguageSettings_1.calcSettingsForLanguage(languageSettings, 'python', 'en');
        chai_1.expect(sPython.allowCompoundWords).to.be.true;
        chai_1.expect(sPython.dictionaries).to.not.be.empty;
        chai_1.expect((sPython.dictionaries).sort()).to.be.deep.equal(['en_us', 'filetypes', 'companies', 'softwareTerms', 'python', 'misc', 'django'].sort());
        const sPhp = LanguageSettings_1.calcSettingsForLanguage(languageSettings, 'php', 'en-gb');
        chai_1.expect(sPhp.allowCompoundWords).to.be.undefined;
        chai_1.expect(sPhp.dictionaries).to.not.be.empty;
        chai_1.expect((sPhp.dictionaries).sort())
            .to.be.deep.equal([
            'en-gb', 'filetypes', 'companies', 'softwareTerms', 'php', 'html',
            'npm', 'fonts', 'css', 'typescript', 'misc', 'fullstack'
        ].sort());
    });
    it('tests that settings at language level are merged', () => {
        const settings = Object.assign({ languageSettings: [] }, CSpellSettingsServer_2.mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings));
        const sPython = LanguageSettings_1.calcSettingsForLanguage(settings.languageSettings, 'python', 'en');
        chai_1.expect(sPython).to.be.not.undefined;
        chai_1.expect(sPython.ignoreRegExpList).to.include('special');
    });
    it('test that user settings include language overrides', () => {
        const settings = Object.assign({ languageSettings: [] }, CSpellSettingsServer_2.mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings));
        const sPython = LanguageSettings_1.calcUserSettingsForLanguage(settings, 'python');
        chai_1.expect(sPython).to.be.not.undefined;
        chai_1.expect(sPython.ignoreRegExpList).to.include('special');
        chai_1.expect(sPython.ignoreRegExpList).to.include('binary');
    });
    it("test that global settings are preserved if language setting doesn't exit.", () => {
        const settings = Object.assign({ enabled: true, allowCompoundWords: false, languageSettings: [] }, CSpellSettingsServer_2.mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings));
        const sPython = LanguageSettings_1.calcUserSettingsForLanguage(settings, 'python');
        chai_1.expect(sPython).to.be.not.undefined;
        chai_1.expect(sPython.enabled).to.be.true;
        chai_1.expect(sPython.allowCompoundWords).to.be.true;
    });
    it('test merged settings with global', () => {
        const merged = CSpellSettingsServer_2.mergeSettings(DefaultSettings_1.getDefaultSettings(), CSpellSettingsServer_1.getGlobalSettings());
        const sPHP = LanguageSettings_1.calcSettingsForLanguage(merged.languageSettings || [], 'php', 'en');
        chai_1.expect(sPHP).to.not.be.empty;
    });
    it('tests matching languageIds', () => {
        const langSet = LS.normalizeLanguageId('PHP, Python | cpp,javascript');
        chai_1.expect(langSet.has('php')).to.be.true;
        chai_1.expect(langSet.has('cpp')).to.be.true;
        chai_1.expect(langSet.has('python')).to.be.true;
        chai_1.expect(langSet.has('javascript')).to.be.true;
        chai_1.expect(langSet.has('typescript')).to.be.false;
    });
    it('tests local matching', () => {
        const localSet = LS.normalizeLocal('en, en-GB, fr-fr, nl_NL');
        chai_1.expect(localSet.has('en')).to.be.true;
        chai_1.expect(LS.isLocalInSet('nl-nl', localSet)).to.be.true;
        chai_1.expect(LS.isLocalInSet('nl_nl', localSet)).to.be.true;
        chai_1.expect(LS.isLocalInSet('en', localSet)).to.be.true;
        chai_1.expect(LS.isLocalInSet('en-US', localSet)).to.be.false;
        chai_1.expect(LS.isLocalInSet('enGB', localSet)).to.be.true;
    });
});
//# sourceMappingURL=LanguageSettings.test.js.map