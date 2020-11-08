import { LanguageSetting, CSpellUserSettings, LocaleId, LanguageId, BaseSetting } from './CSpellSettingsDef';
import * as SpellSettings from './CSpellSettingsServer';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocal: LocaleId = 'en';

const defaultLanguageSettings: LanguageSettings = [];

export function getDefaultLanguageSettings(): LanguageSettings {
    return defaultLanguageSettings;
}

function stringToList(sList: string | string[]): string[] {
    if (typeof sList === 'string') {
        sList = sList
            .replace(/[|;]/g, ',')
            .split(',')
            .map((s) => s.trim());
    }
    return sList;
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map((a) => a.toLowerCase()));
}

function normalizeLanguageIdToString(langId: LanguageId | LanguageId[]): string {
    return [...normalizeLanguageId(langId)].join(',');
}

export function normalizeLocal(local: LocaleId | LocaleId[]): Set<LocaleId> {
    local = stringToList(local);
    return new Set<LocaleId>(local.map((local) => local.toLowerCase().replace(/[^a-z]/g, '')));
}

export function isLocalInSet(local: LocaleId | LocaleId[], setOfLocals: Set<LocaleId>): boolean {
    const locals = normalizeLocal(local);
    return [...locals.values()].filter((local) => setOfLocals.has(local)).length > 0;
}

export function calcSettingsForLanguage(
    languageSettings: LanguageSettings,
    languageId: LanguageId,
    local: LocaleId | LocaleId[]
): BaseSetting {
    languageId = languageId.toLowerCase();
    const allowedLocals = normalizeLocal(local);
    return defaultLanguageSettings
        .concat(languageSettings)
        .filter((s) => !s.languageId || s.languageId === '*' || normalizeLanguageId(s.languageId).has(languageId))
        .filter((s) => !s.local || s.local === '*' || isLocalInSet(s.local, allowedLocals))
        .map((langSetting) => {
            const id = normalizeLanguageIdToString(langSetting.local || langSetting.languageId || 'language');
            const { languageId: _languageId, local: _local, ...s } = { id, ...langSetting };
            return s;
        })
        .reduce(
            (langSetting, setting) => ({
                ...SpellSettings.mergeSettings(langSetting, setting),
                languageId,
                local,
            }),
            {}
        );
}

export function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings {
    const { languageSettings = [], language: local = defaultLocal } = settings;
    const defaults = {
        allowCompoundWords: settings.allowCompoundWords,
        enabled: settings.enabled,
    };
    const langSettings = {
        ...defaults,
        ...calcSettingsForLanguage(languageSettings, languageId, local),
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
