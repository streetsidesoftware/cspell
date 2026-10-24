import type {
    BaseSetting,
    CSpellUserSettings,
    LanguageId,
    LanguageSetting,
    LocaleId,
    Settings,
} from '@cspell/cspell-types';

import { AutoResolveCache, createAutoResolveCache, createAutoResolveWeakCache } from '../util/AutoResolve.js';
import { doSetsIntersect } from '../util/util.js';
import * as SpellSettings from './CSpellSettingsServer.js';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocale: LocaleId = 'en';

const defaultLanguageSettings: LanguageSettings = [];

export function getDefaultLanguageSettings(): LanguageSettings {
    return defaultLanguageSettings;
}

function localesToList(locales: string): string[] {
    return stringToList(locales.replaceAll(/\s+/g, ','));
}

function stringToList(sList: string): string[] {
    return sList
        .replaceAll(/[|;]/g, ',')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
}

function memoize<K, V>(resolver: (k: K) => V): (k: K) => V {
    const cache = createAutoResolveCache<K, V>();
    return (k: K) => cache.get(k, resolver);
}

const _normalizeLanguageId = memoize(__normalizeLanguageId);
function __normalizeLanguageId(langId: LanguageId): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map((a) => a.toLowerCase()));
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    return _normalizeLanguageId(typeof langId === 'string' ? langId : langId.join(','));
}

const _normalizeLocale = memoize(__normalizeLocale);
function __normalizeLocale(locale: LocaleId): Set<LocaleId> {
    const locales = localesToList(locale);
    return new Set<LocaleId>(locales.map((locale) => locale.toLowerCase().replaceAll(/[^a-z]/g, '')));
}

export function normalizeLocale(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    locale = typeof locale === 'string' ? locale : locale.join(',');
    return _normalizeLocale(locale);
}

/**
 * Normalize locales to the form `Intl` uses, for example `en_us` becomes `en-US`.
 * Locales that `Intl` rejects are dropped.
 */
export function normalizeLocaleIntl(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    return _normalizeLocaleIntl(typeof locale === 'string' ? locale : locale.join(','));
}

const _normalizeLocaleIntl = memoize(__normalizeLocaleIntl);
function __normalizeLocaleIntl(locale: LocaleId): Set<LocaleId> {
    const locales = localesToList(locale)
        .map((locale) => toLocaleIntl(locale.replaceAll('_', '-')))
        .filter((locale) => locale !== undefined);
    return new Set(locales);
}

function toLocaleIntl(locale: string): string | undefined {
    try {
        return Intl.getCanonicalLocales(locale)[0];
    } catch {
        return undefined;
    }
}

export function isLocaleInSet(locale: LocaleId | LocaleId[], setOfLocals: Set<LocaleId>): boolean {
    const locales = normalizeLocale(locale);
    return doSetsIntersect(locales, setOfLocals);
}

/**
 * Normalize a locale for use with `Intl` and `toLocaleLowerCase`. Locales that `Intl` rejects are dropped.
 * @param locale - a locale or a list of locales, for example `en,tr_TR`.
 * @returns the valid locales, or `undefined` if there are none.
 */
export function normalizeLocaleForIntl(locale: LocaleId | LocaleId[] | undefined): string | string[] | undefined {
    if (!locale) return undefined;
    const locales = [...normalizeLocaleIntl(locale)];
    if (!locales.length) return undefined;
    if (locales.length === 1) return locales[0];
    return locales;
}

const cacheCalcSettingsForLanguage = createAutoResolveWeakCache<
    LanguageSettings,
    AutoResolveCache<LanguageId, AutoResolveCache<LocaleId, BaseSetting>>
>();

export function calcSettingsForLanguage(
    languageSettings: LanguageSettings,
    languageId: LanguageId,
    locale: LocaleId,
): BaseSetting {
    return cacheCalcSettingsForLanguage
        .get(languageSettings, () => new AutoResolveCache())
        .get(languageId, () => new AutoResolveCache())
        .get(locale, () => _calcSettingsForLanguage(languageSettings, languageId, locale));
}

function _calcSettingsForLanguage(
    languageSettings: LanguageSettings,
    languageId: LanguageId,
    locale: LocaleId,
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

const cacheDoesLanguageSettingMatchLanguageId = createAutoResolveWeakCache<
    LanguageSetting,
    AutoResolveCache<LanguageId, boolean>
>();

function doesLanguageSettingMatchLanguageId(s: LanguageSetting, languageId: LanguageId): boolean {
    return cacheDoesLanguageSettingMatchLanguageId
        .get(s, () => new AutoResolveCache())
        .get(languageId, () => _doesLanguageSettingMatchLanguageId(s, languageId));
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
    languageId: LanguageId[] | LanguageId,
): CSpellUserSettings {
    const langIds: string[] = ['*', ...normalizeLanguageId(languageId)];
    const langSettings = langIds.reduce((settings, languageId) => {
        return calcUserSettingsForLanguage(settings, languageId);
    }, baseSettings);
    return langSettings;
}
