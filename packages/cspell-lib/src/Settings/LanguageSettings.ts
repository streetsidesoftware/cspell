import type {
    BaseSetting,
    CSpellUserSettings,
    LanguageId,
    LanguageSetting,
    LocaleId,
    Settings,
} from '@cspell/cspell-types';

import { memorizerAll } from '../util/Memorizer';
import { doSetsIntersect } from '../util/util';
import * as SpellSettings from './CSpellSettingsServer';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocale: LocaleId = 'en';

const defaultLanguageSettings: LanguageSettings = [];

export function getDefaultLanguageSettings(): LanguageSettings {
    return defaultLanguageSettings;
}

function localesToList(locales: string): string[] {
    return stringToList(locales.replace(/\s+/g, ','));
}

function stringToList(sList: string): string[] {
    return sList
        .replace(/[|;]/g, ',')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
}

const _normalizeLanguageId = memorizerAll(__normalizeLanguageId);
function __normalizeLanguageId(langId: LanguageId): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map((a) => a.toLowerCase()));
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    return _normalizeLanguageId(typeof langId === 'string' ? langId : langId.join(','));
}

const _normalizeLocale = memorizerAll(__normalizeLocale);
function __normalizeLocale(locale: LocaleId): Set<LocaleId> {
    const locales = localesToList(locale);
    return new Set<LocaleId>(locales.map((locale) => locale.toLowerCase().replace(/[^a-z]/g, '')));
}

export function normalizeLocale(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    locale = typeof locale === 'string' ? locale : locale.join(',');
    return _normalizeLocale(locale);
}

export function isLocaleInSet(locale: LocaleId | LocaleId[], setOfLocals: Set<LocaleId>): boolean {
    const locales = normalizeLocale(locale);
    return doSetsIntersect(locales, setOfLocals);
}

export function calcSettingsForLanguage(
    languageSettings: LanguageSettings,
    languageId: LanguageId,
    locale: LocaleId
): BaseSetting {
    languageId = languageId.toLowerCase();
    const allowedLocals = normalizeLocale(locale);
    const ls: Settings & { languageId?: LanguageId; locale?: LocaleId } = languageSettings
        .filter((s) => doesLanguageSettingMatchLanguageId(s, languageId))
        .filter((s) => !s.locale || s.locale === '*' || isLocaleInSet(s.locale, allowedLocals))
        .map((langSetting) => {
            const { languageId: _languageId, locale: _locale, ...s } = langSetting;
            return s;
        })
        .reduce((langSetting, setting) => SpellSettings.mergeSettings(langSetting, setting), {});
    ls.languageId = languageId;
    ls.locale = locale;
    return ls;
}

const cacheDoesLanguageSettingMatchLanguageId: WeakMap<LanguageSetting, Map<LanguageId, boolean>> = new WeakMap();

function doesLanguageSettingMatchLanguageId(s: LanguageSetting, languageId: LanguageId): boolean {
    const r = cacheDoesLanguageSettingMatchLanguageId.get(s) ?? new Map<LanguageId, boolean>();
    const f = r.get(languageId);
    if (f !== undefined) {
        return f;
    }
    const v = _doesLanguageSettingMatchLanguageId(s, languageId);
    r.set(languageId, v);
    cacheDoesLanguageSettingMatchLanguageId.set(s, r);
    return v;
}

function _doesLanguageSettingMatchLanguageId(s: LanguageSetting, languageId: LanguageId): boolean {
    const languageSettingsLanguageIds = s.languageId;
    if (!languageSettingsLanguageIds || languageSettingsLanguageIds === '*') return true;
    const ids = normalizeLanguageId(languageSettingsLanguageIds);
    if (ids.has(languageId)) return true;
    if (ids.has('!' + languageId)) return false;

    const numExcludes = [...ids].filter((id) => id.startsWith('!')).length;
    return numExcludes === ids.size;
}

export function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings {
    const { languageSettings = [], language: locale = defaultLocale, allowCompoundWords, enabled } = settings;
    const langSettings = {
        allowCompoundWords,
        enabled,
        ...calcSettingsForLanguage(languageSettings, languageId, locale),
    };
    return SpellSettings.mergeSettings(settings, langSettings);
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
