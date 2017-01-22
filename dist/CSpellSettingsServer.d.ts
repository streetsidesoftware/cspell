import { CSpellUserSettingsWithComments, CSpellUserSettings } from './CSpellSettingsDef';
export declare const sectionCSpell = "cSpell";
export declare const defaultFileName = "cSpell.json";
export declare function readSettings(filename: string, defaultValues?: CSpellUserSettingsWithComments): CSpellUserSettings;
export declare function readSettingsFiles(filenames: string[]): CSpellUserSettings;
export declare function mergeSettings(left: CSpellUserSettings, ...settings: CSpellUserSettings[]): CSpellUserSettings;
export declare function mergeInDocSettings(left: CSpellUserSettings, right: CSpellUserSettings): CSpellUserSettings;
export declare function finalizeSettings(settings: CSpellUserSettings): CSpellUserSettings;
