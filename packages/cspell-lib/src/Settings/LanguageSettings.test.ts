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
            patterns: [{ name: 'special', pattern: 'special' }],
            ignoreRegExpList: ['special'],
        },
    ],
};

const defaultSettings = getDefaultSettings();
const defaultLanguageSettings = defaultSettings.languageSettings;

describe('Validate LanguageSettings', () => {
    test('tests merging language settings', () => {
        const defaultSettings = getDefaultSettings();
        const languageSettings = defaultSettings.languageSettings || [];
        const sPython = calcSettingsForLanguage(languageSettings, 'python', 'en');
        expect(sPython.allowCompoundWords).toBe(true);
        expect(sPython.dictionaries).not.toHaveLength(0);
        expect(sPython.dictionaries!).toEqual(
            expect.arrayContaining(['en_us', 'filetypes', 'companies', 'softwareTerms', 'python', 'django'])
        );

        const sPhp = calcSettingsForLanguage(languageSettings, 'php', 'en-gb');
        expect(sPhp.allowCompoundWords).toBeUndefined();
        expect(sPhp.dictionaries).not.toHaveLength(0);
        expect(sPhp.dictionaries!).toEqual(
            expect.arrayContaining([
                'en-gb',
                'filetypes',
                'companies',
                'softwareTerms',
                'php',
                'html',
                'npm',
                'fonts',
                'css',
                'typescript',
                'fullstack',
            ])
        );
    });

    test('tests that settings at language level are merged', () => {
        const settings = {
            languageSettings: [],
            ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
        };
        const sPython = calcSettingsForLanguage(settings.languageSettings, 'python', 'en');
        expect(sPython).toBeDefined();
        expect(sPython.ignoreRegExpList).toEqual(expect.arrayContaining(['special']));
    });

    test('that user settings include language overrides', () => {
        const settings = {
            languageSettings: [],
            ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
        };
        const sPython = calcUserSettingsForLanguage(settings, 'python');
        expect(sPython).toBeDefined();
        expect(sPython.ignoreRegExpList).toEqual(expect.arrayContaining(['special']));
        expect(sPython.ignoreRegExpList).toEqual(expect.arrayContaining(['binary']));
    });

    test("that global settings are preserved if language setting doesn't exit.", () => {
        const settings = {
            enabled: true,
            allowCompoundWords: false,
            languageSettings: [],
            ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
        };
        const sPython = calcUserSettingsForLanguage(settings, 'python');
        expect(sPython).toBeDefined();
        expect(sPython.enabled).toBe(true);
        expect(sPython.allowCompoundWords).toBe(true);
    });

    test('merged settings with global', () => {
        const merged = mergeSettings(getDefaultSettings(), getGlobalSettings());
        const sPHP = calcSettingsForLanguage(merged.languageSettings || [], 'php', 'en');
        expect(Object.keys(sPHP)).not.toHaveLength(0);
    });

    test('tests matching languageIds', () => {
        const langSet = LS.normalizeLanguageId('PHP; literate haskell, Python | cpp,javascript');
        expect(langSet.has('php')).toBe(true);
        expect(langSet.has('cpp')).toBe(true);
        expect(langSet.has('python')).toBe(true);
        expect(langSet.has('javascript')).toBe(true);
        expect(langSet.has('typescript')).toBe(false);
        expect(langSet.has('literate haskell')).toBe(true);
    });

    test('tests local matching', () => {
        const localSet = LS.normalizeLocal('en, en-GB, fr-fr, nl_NL');
        expect(localSet.has('en')).toBe(true);
        expect(LS.isLocalInSet('nl-nl', localSet)).toBe(true);
        expect(LS.isLocalInSet('nl_nl', localSet)).toBe(true);
        expect(LS.isLocalInSet('en', localSet)).toBe(true);
        expect(LS.isLocalInSet('en-US', localSet)).toBe(false);
        expect(LS.isLocalInSet('enGB', localSet)).toBe(true);
    });
});
