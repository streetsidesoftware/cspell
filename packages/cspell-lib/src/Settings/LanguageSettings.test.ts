/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { CSpellUserSettings } from '@cspell/cspell-types';
import { getGlobalSettings } from './Controller/configLoader';
import { mergeSettings } from './CSpellSettingsServer';
import { getDefaultBundledSettings } from './DefaultSettings';
import * as LS from './LanguageSettings';
import { calcSettingsForLanguage, calcUserSettingsForLanguage } from './LanguageSettings';

const extraSettings: CSpellUserSettings = {
    ignoreRegExpList: ['binary'],
    languageSettings: [
        {
            languageId: 'python',
            patterns: [{ name: 'special', pattern: 'special' }],
            ignoreRegExpList: ['special'],
        },
        {
            languageId: '!python,!javascript',
            ignoreRegExpList: ['no-python-and-javascript'],
        },
        {
            languageId: 'python,javascript',
            ignoreRegExpList: ['python-and-javascript'],
        },
    ],
};

const defaultSettings = getDefaultBundledSettings();
const defaultLanguageSettings = defaultSettings.languageSettings;

describe('Validate LanguageSettings', () => {
    test('tests merging language settings', () => {
        const defaultSettings = getDefaultBundledSettings();
        const languageSettings = defaultSettings.languageSettings || [];
        const sPython = calcSettingsForLanguage(languageSettings, 'python', 'en');
        expect(sPython.allowCompoundWords).toBeUndefined();
        expect(sPython.dictionaries).not.toHaveLength(0);
        expect(sPython.dictionaries!).toEqual(expect.arrayContaining(['en_us', 'python', 'django']));

        const sPhp = calcSettingsForLanguage(languageSettings, 'php', 'en-gb');
        expect(sPhp.allowCompoundWords).toBeUndefined();
        expect(sPhp.dictionaries).not.toHaveLength(0);
        expect(sPhp.dictionaries!).toEqual(
            expect.arrayContaining(['en-gb', 'php', 'html', 'npm', 'fonts', 'css', 'typescript', 'fullstack'])
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
    });

    test.each`
        languageId      | ignoreContains                                    | ignoreNotContains
        ${'python'}     | ${['binary', 'special', 'python-and-javascript']} | ${['no-python-and-javascript']}
        ${'javascript'} | ${['binary', 'python-and-javascript']}            | ${['no-python-and-javascript']}
        ${'plaintext'}  | ${['binary', 'no-python-and-javascript']}         | ${['python-and-javascript']}
    `(
        'that ! works for $languageId, contains $ignoreContains, $ignoreNotContains',
        ({ languageId, ignoreContains, ignoreNotContains }) => {
            const settings = {
                enabled: true,
                allowCompoundWords: false,
                languageSettings: [],
                ...mergeSettings({ languageSettings: defaultLanguageSettings }, extraSettings),
            };
            const s = calcUserSettingsForLanguage(settings, languageId);
            expect(s.ignoreRegExpList).toEqual(expect.arrayContaining(ignoreContains));
            expect(s.ignoreRegExpList).not.toEqual(expect.arrayContaining(ignoreNotContains));
        }
    );

    test('merged settings with global', () => {
        const merged = mergeSettings(getDefaultBundledSettings(), getGlobalSettings());
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
        expect(langSet).toContain('literate haskell');
    });

    // cspell:ignore engb frfr nlnl
    test.each`
        locales                          | expected
        ${''}                            | ${[]}
        ${'en, en-GB, fr-fr, nl_NL'}     | ${['en', 'engb', 'frfr', 'nlnl']}
        ${['en, en-GB', 'fr-fr, nl_NL']} | ${['en', 'engb', 'frfr', 'nlnl']}
    `('normalizeLocale $locales', ({ locales, expected }) => {
        const localeSet = LS.normalizeLocale(locales);
        expect([...localeSet]).toEqual(expected);
    });

    test('normalizeLocale $locales', () => {
        const localeSet = LS.normalizeLocale('en, en-GB, fr-fr,nl_NL');
        expect(localeSet.has('en')).toBe(true);
        expect(LS.isLocaleInSet('nl-nl', localeSet)).toBe(true);
        expect(LS.isLocaleInSet('nl_nl', localeSet)).toBe(true);
        expect(LS.isLocaleInSet('en', localeSet)).toBe(true);
        expect(LS.isLocaleInSet('en-US', localeSet)).toBe(false);
        expect(LS.isLocaleInSet('enGB', localeSet)).toBe(true);
    });
});
