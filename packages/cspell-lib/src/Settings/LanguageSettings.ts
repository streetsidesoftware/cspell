import type { LanguageSetting, CSpellUserSettings, LocaleId, LanguageId, BaseSetting } from '@cspell/cspell-types';
import * as SpellSettings from './CSpellSettingsServer';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocale: LocaleId = 'en';

const defaultLanguageSettings: LanguageSettings = [];

export function getDefaultLanguageSettings(): LanguageSettings {
    return defaultLanguageSettings;
}

function localesToList(locales: string | string[]): string[] {
    locales = typeof locales !== 'string' ? locales.join(',') : locales;
    return stringToList(locales.replace(/\s+/g, ','));
}

function stringToList(sList: string | string[]): string[] {
    if (typeof sList !== 'string') {
        sList = sList.join(',');
    }
    sList = sList
        .replace(/[|;]/g, ',')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
    return sList;
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map((a) => a.toLowerCase()));
}

function normalizeLanguageIdToString(langId: LanguageId | LanguageId[]): string {
    return [...normalizeLanguageId(langId)].join(',');
}

export function normalizeLocale(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    locale = localesToList(locale);
    return new Set<LocaleId>(locale.map((locale) => locale.toLowerCase().replace(/[^a-z]/g, '')));
}

export function isLocaleInSet(locale: LocaleId | LocaleId[], setOfLocals: Set<LocaleId>): boolean {
    const locales = normalizeLocale(locale);
    return [...locales.values()].filter((locale) => setOfLocals.has(locale)).length > 0;
}

export function calcSettingsForLanguage(
    languageSettings: LanguageSettings,
    languageId: LanguageId,
    locale: LocaleId | LocaleId[]
): BaseSetting {
    languageId = languageId.toLowerCase();
    const allowedLocals = normalizeLocale(locale);
    return defaultLanguageSettings
        .concat(languageSettings)
        .filter((s) => doesLanguageSettingMatchLanguageId(s, languageId))
        .filter((s) => !s.locale || s.locale === '*' || isLocaleInSet(s.locale, allowedLocals))
        .map((langSetting) => {
            const id = normalizeLanguageIdToString(langSetting.locale || langSetting.languageId || 'language');
            const { languageId: _languageId, locale: _local, ...s } = { id, ...langSetting };
            return s;
        })
        .reduce(
            (langSetting, setting) => ({
                ...SpellSettings.mergeSettings(langSetting, setting),
                languageId,
                locale,
            }),
            {}
        );
}

function doesLanguageSettingMatchLanguageId(s: LanguageSetting, languageId: LanguageId): boolean {
    const languageSettingsLanguageIds = s.languageId;
    if (!languageSettingsLanguageIds || languageSettingsLanguageIds === '*') return true;
    const ids = normalizeLanguageId(languageSettingsLanguageIds);
    if (ids.has(languageId)) return true;
    if (ids.has('!' + languageId)) return false;

    const numExcludes = [...ids].filter((id) => id.startsWith('!')).length;
    return numExcludes === ids.size;
}

export function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings {
    const { languageSettings = [], language: locale = defaultLocale } = settings;
    const defaults = {
        allowCompoundWords: settings.allowCompoundWords,
        enabled: settings.enabled,
    };
    const langSettings = {
        ...defaults,
        ...calcSettingsForLanguage(languageSettings, languageId, locale),
    };
    return SpellSettings.mergeSettings(settings, langSettings as CSpellUserSettings);
}

export function calcSettingsForLanguageId(
    baseSettings: CSpellUserSettings,
    languageId: LanguageId[] | LanguageId
): CSpellUserSettings {
    const langIds: string[] = ['*'].concat(languageId instanceof Array ? languageId : [languageId]);
    const langSettings = langIds.reduce((settings, languageId) => {
        return calcUserSettingsForLanguage(settings, languageId);
    }, baseSettings);
    return langSettings;
}
