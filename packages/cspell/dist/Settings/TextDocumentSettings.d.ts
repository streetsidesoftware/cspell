import { CSpellUserSettings } from './CSpellSettingsDef';
export declare function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string, languageId: string | string[]): CSpellUserSettings;
export declare function extractSettingsFromText(text: string): CSpellUserSettings;
