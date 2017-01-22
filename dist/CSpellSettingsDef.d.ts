/**
 * These settings come from user and workspace settings.
 */
export interface CSpellPackageSettings extends CSpellUserSettings {
}
export interface CSpellUserSettings extends BaseSetting {
    version?: string;
    language?: LocalId;
    words?: string[];
    ignoreWords?: string[];
    ignorePaths?: Glob[];
    flagWords?: string[];
    enabled?: boolean;
    showStatus?: boolean;
    spellCheckDelayMs?: number;
    enabledLanguageIds?: LanguageId[];
    maxNumberOfProblems?: number;
    userWords?: string[];
    minWordLength?: number;
    numSuggestions?: number;
    languageSettings?: LanguageSetting[];
}
export interface BaseSetting {
    allowCompoundWords?: boolean;
    dictionaryDefinitions?: DictionaryDefinition[];
    dictionaries?: DictionaryId[];
    ignoreRegExpList?: RegExpList;
    includeRegExpList?: RegExpList;
    patterns?: RegExpPatternDefinition[];
}
export declare type DictionaryFileTypes = 'S' | 'W' | 'C';
export interface DictionaryDefinition {
    name: DictionaryId;
    path?: string;
    file: string;
    type?: DictionaryFileTypes;
}
export interface LanguageSetting extends BaseSetting {
    languageId: string;
    local?: LocalId;
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
}
export interface CSpellUserSettingsWithComments extends CSpellUserSettings {
    '//^'?: string[];
    '// version'?: string[];
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
    '//$'?: string[];
}
