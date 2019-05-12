import { LanguageSetting, CSpellUserSettings, LocalId, LanguageId, BaseSetting } from './CSpellSettingsDef';
export declare type LanguageSettings = LanguageSetting[];
export declare function getDefaultLanguageSettings(): LanguageSettings;
export declare function normalizeLanguageId(langId: LanguageId | LanguageId[]): Set<LanguageId>;
export declare function normalizeLocal(local: LocalId | LocalId[]): Set<LocalId>;
export declare function isLocalInSet(local: LocalId | LocalId[], setOfLocals: Set<LocalId>): boolean;
export declare function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: LanguageId, local: LocalId | LocalId[]): BaseSetting;
export declare function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings;
export declare function calcSettingsForLanguageId(baseSettings: CSpellUserSettings, languageId: LanguageId[] | LanguageId): CSpellUserSettings;
