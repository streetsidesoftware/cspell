import { CSpellUserSettingsWithComments, CSpellSettings, Glob } from './CSpellSettingsDef';
export declare const sectionCSpell = "cSpell";
export declare const defaultFileName = "cSpell.json";
export declare function readSettings(filename: string, defaultValues?: CSpellUserSettingsWithComments): CSpellSettings;
export declare function readSettingsFiles(filenames: string[]): CSpellSettings;
export declare function mergeSettings(left: CSpellSettings, ...settings: CSpellSettings[]): CSpellSettings;
export declare function mergeInDocSettings(left: CSpellSettings, right: CSpellSettings): CSpellSettings;
export declare function calcOverrideSettings(settings: CSpellSettings, filename: string): CSpellSettings;
export declare function finalizeSettings(settings: CSpellSettings): CSpellSettings;
export declare function getGlobalSettings(): CSpellSettings;
export declare function getCachedFileSize(): number;
export declare function clearCachedFiles(): void;
export declare function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean;
/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings settings to search
 */
export declare function getSources(settings: CSpellSettings): CSpellSettings[];
