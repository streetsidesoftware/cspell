export declare type ReplaceEntry = [string, string];
export declare type ReplaceMap = ReplaceEntry[];
/**
 * These settings come from user and workspace settings.
 */
export interface CSpellPackageSettings extends CSpellUserSettings {
}
export interface CSpellUserSettings extends CSpellSettings {
}
export interface CSpellSettings extends FileSettings, LegacySettings {
    source?: Source;
}
export interface FileSettings extends ExtendableSettings {
    version?: string;
    userWords?: string[];
    import?: string | string[];
}
export interface ExtendableSettings extends Settings {
    overrides?: OverrideSettings[];
}
export interface Settings extends BaseSetting {
    language?: LocalId;
    words?: string[];
    ignoreWords?: string[];
    ignorePaths?: Glob[];
    flagWords?: string[];
    enabledLanguageIds?: LanguageId[];
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    numSuggestions?: number;
    languageSettings?: LanguageSetting[];
    languageId?: LanguageId;
}
export interface LegacySettings {
    /***********************
     * VS Code Spell Checker Settings below
     * To be Removed
     */
    showStatus?: boolean;
    spellCheckDelayMs?: number;
}
export interface OverrideSettings extends Settings, OverrideFilterFields {
    languageId?: LanguageId;
    language?: LocalId;
}
export interface OverrideFilterFields {
    filename: Glob | Glob[];
}
export interface BaseSetting {
    id?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
    allowCompoundWords?: boolean;
    dictionaryDefinitions?: DictionaryDefinition[];
    dictionaries?: DictionaryId[];
    ignoreRegExpList?: RegExpList;
    includeRegExpList?: RegExpList;
    patterns?: RegExpPatternDefinition[];
}
export declare type DictionaryFileTypes = 'S' | 'W' | 'C' | 'T';
export interface DictionaryDefinition {
    name: DictionaryId;
    description?: string;
    path?: string;
    file: string;
    type?: DictionaryFileTypes;
    repMap?: ReplaceMap;
    useCompounds?: boolean;
}
export interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {
}
export interface LanguageSettingFilterFields {
    languageId: LanguageId | LanguageId[];
    local?: LocalId | LocalId[];
}
export declare type RegExpList = PatternRef[];
export declare type PatternRef = Pattern | PatternId;
export declare type Pattern = string | RegExp;
export declare type PatternId = string;
export declare type DictionaryId = string;
export declare type LocalId = string;
export declare type Glob = string;
export declare type LanguageId = string;
export interface RegExpPatternDefinition {
    name: PatternId;
    pattern: PatternRef;
    description?: string;
}
export interface CSpellUserSettingsWithComments extends CSpellUserSettings {
    '//^'?: string[];
    '// version'?: string[];
    '// name'?: string[];
    '// description'?: string[];
    '// language'?: string[];
    '// words'?: string[];
    '// ignorePaths'?: string[];
    '// flagWords'?: string[];
    '// enabled'?: string[];
    '// showStatus'?: string[];
    '// spellCheckDelayMs'?: string[];
    '// enabledLanguageIds'?: string[];
    '// maxNumberOfProblems'?: string[];
    '// userWords'?: string[];
    '// minWordLength'?: string[];
    '// numSuggestions'?: string[];
    '// ignoreRegExpList'?: string[];
    '// allowCompoundWords'?: string[];
    '// import'?: string[];
    '//$'?: string[];
}
export interface Source {
    name: string;
    filename?: string;
    sources?: CSpellSettings[];
}
