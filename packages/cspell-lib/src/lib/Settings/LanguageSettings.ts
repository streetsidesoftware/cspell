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

function memorizer<K, V>(resolver: (k: K) => V): (k: K) => V {
    const cache = createAutoResolveCache<K, V>();
    return (k: K) => cache.get(k, resolver);
}

const _normalizeLanguageId = memorizer(__normalizeLanguageId);
function __normalizeLanguageId(langId: LanguageId): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map((a) => a.toLowerCase()));
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    return _normalizeLanguageId(typeof langId === 'string' ? langId : langId.join(','));
}

const _normalizeLocale = memorizer(__normalizeLocale);
function __normalizeLocale(locale: LocaleId): Set<LocaleId> {
    const locales = localesToList(locale);
    return new Set<LocaleId>(locales.map((locale) => locale.toLowerCase().replaceAll(/[^a-z]/g, '')));
}

export function normalizeLocale(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    locale = typeof locale === 'string' ? locale : locale.join(',');
    return _normalizeLocale(locale);
}

export function normalizeLocaleIntl(locale: LocaleId | LocaleId[]): Set<LocaleId> {
    const values = [...normalizeLocale(locale)].map((locale) =>
        locale.replace(/^([a-z]{2})-?([a-z]{2})$/, (_, lang: string, locale?: string) =>
            locale ? `${lang}-${locale.toUpperCase()}` : lang,
        ),
    );
    return new Set(values);
}

export function isLocaleInSet(locale: LocaleId | LocaleId[], setOfLocals: Set<LocaleId>): boolean {
    const locales = normalizeLocale(locale);
    return doSetsIntersect(locales, setOfLocals);
}

const regExpValidIntlLocaleStrict = /^[a-z]{2}(-[A-Z]{2})?$/;
const regExpValidIntlLocale = new RegExp(regExpValidIntlLocaleStrict, 'i');

/**
 * Test if a locale should be ok with Intl
 * @param locale - locale string
 * @param strict - case must match
 * @returns true if it matches the standard 2 letter or 4 letter forms.
 */
export function isValidLocaleIntlFormat(locale: LocaleId | LocaleId[], strict = false): boolean {
    if (typeof locale === 'string')
        return strict ? regExpValidIntlLocaleStrict.test(locale) : regExpValidIntlLocale.test(locale);

    for (const item of locale) {
        if (!isValidLocaleIntlFormat(item, strict)) return false;
    }

    return locale.length > 0;
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
