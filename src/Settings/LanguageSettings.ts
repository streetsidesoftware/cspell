import { LanguageSetting, CSpellUserSettings, LocalId, LanguageId } from './CSpellSettingsDef';
import * as SpellSettings from './CSpellSettingsServer';

// cspell:ignore filetypes

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocal: LocalId = 'en';

export const defaultLanguageSettings: LanguageSettings = [
    { languageId: '*',                                   dictionaries: ['companies', 'softwareTerms', 'misc', 'filetypes'], },
    { languageId: 'go',     allowCompoundWords: true,    dictionaries: ['go'], },
    { languageId: 'c',      allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'cpp',    allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'csharp', allowCompoundWords: true,    dictionaries: ['csharp', 'dotnet', 'npm'] },
    { languageId: 'javascript',                          dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'javascriptreact',                     dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescript',                          dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescriptreact',                     dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'html',                                dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'latex',                               dictionaries: ['latex'] },
    { languageId: 'markdown',                            dictionaries: ['npm'] },
    { languageId: 'jade',                                dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'json',                                dictionaries: ['node', 'npm'] },
    { languageId: 'pug',                                 dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'php',                                 dictionaries: ['php', 'html', 'fonts', 'css', 'typescript', 'npm'] },
    { languageId: 'css',                                 dictionaries: ['fonts', 'css'] },
    { languageId: 'less',                                dictionaries: ['fonts', 'css'] },
    { languageId: 'scss',                                dictionaries: ['fonts', 'css'] },
    { languageId: 'map',    enabled: false },
    { languageId: 'image',  enabled: false },
    { languageId: 'binary', enabled: false },
    {
        languageId: 'python',
        allowCompoundWords: true,
        dictionaries: ['python'],
        ignoreRegExpList: [ 'binary_string', 'unicode_string' ],
        patterns: [
            { name: 'binary_string', pattern: "\\bb'" },
            { name: 'unicode_string', pattern: "\\bu'" }
        ]
    },
];

export function getDefaultLanguageSettings(): CSpellUserSettings {
    return { languageSettings: defaultLanguageSettings };
}

function normalizeLocal(local: LocalId | LocalId[]): Set<LocalId> {
    if (typeof local === 'string') {
        local = local.split(',');
    }
    return new Set<LocalId>(local.map(local => local.toLowerCase().replace(/[^a-z]/g, '')));
}

function isLocalInSet(local: LocalId | LocalId[], setOfLocals: Set<LocalId>): boolean {
    const locals = normalizeLocal(local);
    return [...locals.values()].filter(local => setOfLocals.has(local)).length > 0;
}

export function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: LanguageId, local: LocalId | LocalId[]): LanguageSetting {
    const allowedLocals = normalizeLocal(local);
    return defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || s.languageId.toLowerCase() === languageId)
        .filter(s => !s.local || s.local === '*' || isLocalInSet(s.local, allowedLocals) )
        .reduce((langSetting, setting) => ({
            ...SpellSettings.mergeSettings(langSetting, setting),
            languageId,
            local,
        }));
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

