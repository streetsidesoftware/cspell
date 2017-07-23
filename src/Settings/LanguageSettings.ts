import { LanguageSetting, CSpellUserSettings, LocalId, LanguageId, BaseSetting } from './CSpellSettingsDef';
import * as SpellSettings from './CSpellSettingsServer';

// cspell:ignore filetypes

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocal: LocalId = 'en';

const defaultLanguageSettings: LanguageSettings = [
];

export function getDefaultLanguageSettings(): LanguageSettings {
    return defaultLanguageSettings;
}

function stringToList(sList: string | string[]): string[] {
    if (typeof sList === 'string') {
        sList = sList.replace(/\|/g, ',').replace(/\s/g, '').split(',');
    }
    return sList;
}

export function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId> {
    const langIds = stringToList(langId);
    return new Set<LanguageId>(langIds.map(a => a.toLowerCase()));
}

export function normalizeLocal(local: LocalId | LocalId[]): Set<LocalId> {
    local = stringToList(local);
    return new Set<LocalId>(local.map(local => local.toLowerCase().replace(/[^a-z]/g, '')));
}

export function isLocalInSet(local: LocalId | LocalId[], setOfLocals: Set<LocalId>): boolean {
    const locals = normalizeLocal(local);
    return [...locals.values()].filter(local => setOfLocals.has(local)).length > 0;
}

export function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: LanguageId, local: LocalId | LocalId[]): BaseSetting {
    languageId = languageId.toLowerCase();
    const allowedLocals = normalizeLocal(local);
    return defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || normalizeLanguageId(s.languageId).has(languageId))
        .filter(s => !s.local || s.local === '*' || isLocalInSet(s.local, allowedLocals) )
        .map(langSetting => {
            const s = {...langSetting};
            delete s.languageId;
            delete s.local;
            return s as BaseSetting;
        })
        .reduce((langSetting, setting) => ({
            ...SpellSettings.mergeSettings(langSetting, setting),
            languageId,
            local,
        }), {});
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
    return  SpellSettings.mergeSettings(settings, langSettings as CSpellUserSettings);
}

export function calcSettingsForLanguageId(baseSettings: CSpellUserSettings, languageId: LanguageId[] | LanguageId): CSpellUserSettings {
    const langIds: string[] = ['*'].concat(languageId instanceof Array ? languageId : [languageId]);
    const langSettings = langIds.reduce((settings, languageId) => {
        return calcUserSettingsForLanguage(settings, languageId);
    }, baseSettings);
    return langSettings;
}

