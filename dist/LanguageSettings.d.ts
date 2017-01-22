import { LanguageSetting, CSpellUserSettings, LocalId, LanguageId } from './CSpellSettingsDef';
export declare type LanguageSettings = LanguageSetting[];
export declare const defaultLanguageSettings: LanguageSettings;
export declare function getDefaultLanguageSettings(): CSpellUserSettings;
export declare function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: LanguageId, local: LocalId): LanguageSetting;
export declare function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings;
