import { expect } from 'chai';
import { calcSettingsForLanguage, calcUserSettingsForLanguage } from './LanguageSettings';
import { getGlobalSettings } from './CSpellSettingsServer';
import { getDefaultSettings } from './DefaultSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import { mergeSettings } from './CSpellSettingsServer';
import * as LS from './LanguageSettings';

const extraSettings: CSpellUserSettings = {
    ignoreRegExpList: ['binary'],
    languageSettings: [
        {
            languageId: 'python',
            patterns: [ { name: 'special', pattern: 'special'} ],
            ignoreRegExpList: [
                'special'
            ],
        }
    ],
};

const defaultSettings = getDefaultSettings();
const defaultLanguageSettings = defaultSettings.languageSettings;

describe('Validate LanguageSettings', () => {
    test('tests merging language settings', () => {
        const defaultSettings = getDefaultSettings();
        const languageSettings = defaultSettings.languageSettings || [];
        const sPython = calcSettingsForLanguage(languageSettings, 'python', 'en');
        expect(sPython.allowCompoundWords).to.be.true;
        expect(sPython.dictionaries).to.not.be.empty;
        expect(sPython.dictionaries!).to.include.members(['en_us', 'filetypes', 'companies', 'softwareTerms', 'python', 'misc', 'django']);

        const sPhp = calcSettingsForLanguage(languageSettings, 'php', 'en-gb');
        expect(sPhp.allowCompoundWords).to.be.undefined;
        expect(sPhp.dictionaries).to.not.be.empty;
        expect(sPhp.dictionaries!)
            .to.include.members([
                'en-gb', 'filetypes', 'companies', 'softwareTerms', 'php', 'html',
                'npm', 'fonts', 'css', 'typescript', 'misc', 'fullstack'
            ]);
    });

    test('tests that settings at language level are merged', () => {
        const settings = {
            languageSettings: [],
            ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
        };
        const sPython = calcSettingsForLanguage(settings.languageSettings, 'python', 'en');
        expect(sPython).to.be.not.undefined;
        expect(sPython.ignoreRegExpList).to.include('special');
    });

    test('test that user settings include language overrides', () => {
        const settings = {
            languageSettings: [],
            ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
        };
        const sPython = calcUserSettingsForLanguage(settings, 'python');
        expect(sPython).to.be.not.undefined;
        expect(sPython.ignoreRegExpList).to.include('special');
        expect(sPython.ignoreRegExpList).to.include('binary');
    });

    test(
        "test that global settings are preserved if language setting doesn't exit.",
        () => {
            const settings = {
                enabled: true,
                allowCompoundWords: false,
                languageSettings: [],
                ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
            };
            const sPython = calcUserSettingsForLanguage(settings, 'python');
            expect(sPython).to.be.not.undefined;
            expect(sPython.enabled).to.be.true;
            expect(sPython.allowCompoundWords).to.be.true;
        }
    );

    test('test merged settings with global', () => {
        const merged = mergeSettings(getDefaultSettings(), getGlobalSettings());
        const sPHP = calcSettingsForLanguage(merged.languageSettings || [], 'php', 'en');
        expect(sPHP).to.not.be.empty;
    });

    test('tests matching languageIds', () => {
        const langSet = LS.normalizeLanguageId('PHP, Python | cpp,javascript');
        expect(langSet.has('php')).to.be.true;
        expect(langSet.has('cpp')).to.be.true;
        expect(langSet.has('python')).to.be.true;
        expect(langSet.has('javascript')).to.be.true;
        expect(langSet.has('typescript')).to.be.false;
    });

    test('tests local matching', () => {
        const localSet = LS.normalizeLocal('en, en-GB, fr-fr, nl_NL');
        expect(localSet.has('en')).to.be.true;
        expect(LS.isLocalInSet('nl-nl', localSet)).to.be.true;
        expect(LS.isLocalInSet('nl_nl', localSet)).to.be.true;
        expect(LS.isLocalInSet('en', localSet)).to.be.true;
        expect(LS.isLocalInSet('en-US', localSet)).to.be.false;
        expect(LS.isLocalInSet('enGB', localSet)).to.be.true;
    });
});
