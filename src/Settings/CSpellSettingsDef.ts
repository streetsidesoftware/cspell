
import {ReplaceMap} from '../util/repMap';
export {ReplaceMap} from '../util/repMap';

/**
 * These settings come from user and workspace settings.
 */
export interface CSpellPackageSettings extends CSpellUserSettings {
}

export interface CSpellUserSettings extends FileSettings, LegacySettings {}

export interface FileSettings extends ExtendableSettings {
    // Version of the setting file.
    version?: string;

    // Words to add to dictionary -- should only be in the user config file.
    userWords?: string[];

    // Other settings files to be included
    import?: string | string[];
}

export interface ExtendableSettings extends Settings {
    // Overrides to apply based upon the file path.
    overrides?: OverrideSettings[];
}

export interface Settings extends BaseSetting {
    // current active spelling language
    language?: LocalId;

    // list of words to be always considered correct
    words?: string[];

    // list of words to be ignored
    ignoreWords?: string[];

    // matching file paths will to be ignored
    ignorePaths?: Glob[];

    // list of words to always be considered incorrect.
    flagWords?: string[];

    // languageIds for the files to spell check.
    enabledLanguageIds?: LanguageId[];

    // The maximum number of problems to report in a file.
    maxNumberOfProblems?: number;

    // The maximum number of times the same word can be flagged as an error in a file.
    maxDuplicateProblems?: number;

    // The minimum length of a word before checking it against a dictionary.
    minWordLength?: number;

    // Number of suggestions to make
    numSuggestions?: number;

    // Additional settings for individual languages.
    languageSettings?: LanguageSetting[];

    // Forces the spell checker to assume a give language id. Used mainly as an Override.
    languageId?: LanguageId;
}

export interface LegacySettings {
    /***********************
     * VS Code Spell Checker Settings below
     * To be Removed
     */

    // Show status
    showStatus?: boolean;

    // Delay in ms after a document has changed before checking it for spelling errors.
    spellCheckDelayMs?: number;
    /************************/
}

export interface OverrideSettings extends Settings, OverrideFilterFields {
    // Sets the programming language id
    languageId?: LanguageId;

    // Sets the local
    language?: LocalId;
}

export interface OverrideFilterFields {
    filename: Glob | Glob[];
}

export interface BaseSetting {
    // Optional identifier
    id?: string;

    // Optional name of configuration
    name?: string;

    // Optional description of configuration
    description?: string;

    // Enabled
    enabled?: boolean;

    // True to enable compound word checking.
    allowCompoundWords?: boolean;

    // Define additional available dictionaries
    dictionaryDefinitions?: DictionaryDefinition[];

    // Optional list of dictionaries to use.
    dictionaries?: DictionaryId[];

    // List of patterns to exclude from spell checking
    ignoreRegExpList?: RegExpList;

    // List of patterns to define the text to be included for spell checking
    includeRegExpList?: RegExpList;

    // Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList
    patterns?: RegExpPatternDefinition[];
}

export type DictionaryFileTypes = 'S'|'W'|'C'|'T';

export interface DictionaryDefinition {
    // The reference name of the dictionary, used with program language settings
    name: DictionaryId;
    // Optional description
    description?: string;
    // Path to the file, if undefined the path to the extension dictionaries is assumed
    path?: string;
    // File name
    file: string;
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: DictionaryFileTypes;
    // Replacement pairs
    repMap?: ReplaceMap;
    // Use Compounds
    useCompounds?: boolean;
}

export interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {
}

export interface LanguageSettingFilterFields {
    // The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages
    languageId: LanguageId | LanguageId[];
    // The local filter, matches against the language. This can be a comma separated list. "*" will match all locals.
    local?: LocalId | LocalId[];
}

export type RegExpList = PatternRef[];

// A PatternRef is a Pattern or PatternId.
export type PatternRef = Pattern | PatternId;

export type Pattern = string | RegExp;

// This matches the name in a pattern definition
export type PatternId = string;

// This matches the name in a dictionary definition
export type DictionaryId = string;

// This is a written language local like: 'en', 'en-UK', 'fr', 'es', 'de', etc.
export type LocalId = string;

// These are glob expressions
export type Glob = string;

// This can be '*', 'typescript', 'cpp', 'json', etc.
export type LanguageId = string;

export interface RegExpPatternDefinition {
    name: PatternId;
    pattern: PatternRef;
    description?: string;
}

export interface CSpellUserSettingsWithComments extends CSpellUserSettings {
    // comment at the beginning of the file
    '//^'?: string[];

    // Version of the setting file.
    '// version'?: string[];

    // Name of configuration
    '// name'?: string[];

    // Description of configuration
    '// description'?: string[];

    // current active spelling language
    '// language'?: string[];

    // list of words to be always considered correct
    '// words'?: string[];  // comment for

    // matching file paths will to be ignored
    '// ignorePaths'?: string[];

    // list of words to always be considered incorrect.
    '// flagWords'?: string[];

    // Enabled
    '// enabled'?: string[];

    // Show status
    '// showStatus'?: string[];

    // Delay after a document has changed before checking it for spelling errors.
    '// spellCheckDelayMs'?: string[];

    // languageIds for the files to spell check.
    '// enabledLanguageIds'?: string[];

    // The maximum number of problems to report in a file.
    '// maxNumberOfProblems'?: string[];

    // Words to add to dictionary -- should only be in the user config file.
    '// userWords'?: string[];

    // The minimum length of a word before checking it against a dictionary.
    '// minWordLength'?: string[];

    // Number of suggestions to make
    '// numSuggestions'?: string[];

    // List of patterns to exclude from spell checking
    '// ignoreRegExpList'?: string[];

    // Compound Word settings
    '// allowCompoundWords'?: string[];

    // Include other settings files.
    '// import'?: string[];

    // comment at the end of the file
    '//$'?: string[];
}

