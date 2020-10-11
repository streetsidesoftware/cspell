
export type ReplaceEntry = [string, string];
export type ReplaceMap = ReplaceEntry[];

/**
 * These settings come from user and workspace settings.
 */
export interface CSpellPackageSettings extends CSpellUserSettings {}

export interface CSpellUserSettings extends CSpellSettings {}

export interface CSpellSettings extends FileSettings, LegacySettings {
    $schema?: string;
}

export interface CSpellSettingsWithSourceTrace extends CSpellSettings {
    source?: Source;
}

export interface FileSettings extends ExtendableSettings {
    /**
     * Configuration format version of the setting file.
     * @default "0.1"
     */
    version?: string | '0.1';

    /** Words to add to dictionary -- should only be in the user config file. */
    userWords?: string[];

    /** Other settings files to be included */
    import?: FsPath | FsPath[];
}

export interface ExtendableSettings extends Settings {
    /** Overrides to apply based upon the file path. */
    overrides?: OverrideSettings[];
}

export interface Settings extends BaseSetting {
    /**
     * Current active spelling language
     *
     * Example: "en-GB" for British English
     *
     * Example: "en,nl" to enable both English and Dutch
     * @default "en"
     */
    language?: LocaleId;

    /** list of words to be ignored */
    ignoreWords?: string[];

    /** Glob file patterns to be ignored */
    ignorePaths?: Glob[];

    /** languageIds for the files to spell check. */
    enabledLanguageIds?: LanguageId[];

    /**
     * The maximum number of problems to report in a file.
     * @default 100
     */
    maxNumberOfProblems?: number;

    /**
     * The maximum number of times the same word can be flagged as an error in a file.
     * @default 5
     */
    maxDuplicateProblems?: number;

    /**
     * The minimum length of a word before checking it against a dictionary.
     * @default 4
     */
    minWordLength?: number;

    /**
     * Number of suggestions to make
     * @default 10
     */
    numSuggestions?: number;

    /** Additional settings for individual languages. */
    languageSettings?: LanguageSetting[];

    /** Forces the spell checker to assume a give language id. Used mainly as an Override. */
    languageId?: LanguageId;
}

    /**
     * VS Code Spell Checker Settings
     * To be Removed
     * @deprecated
     */
    export interface LegacySettings {

    /**
     * Show status
     * @deprecated
     */
    showStatus?: boolean;

    /**
     * Delay in ms after a document has changed before checking it for spelling errors.
     * @deprecated
     */
    spellCheckDelayMs?: number;
    /************************/
}

export interface OverrideSettings extends Settings, OverrideFilterFields {
    /** Sets the programming language id */
    languageId?: LanguageId;

    /** Sets the locale */
    language?: LocaleId;
}

export interface OverrideFilterFields {
    /** Glob pattern or patterns to match against */
    filename: Glob | Glob[];
}

export interface BaseSetting {
    /** Optional identifier */
    id?: string;

    /** Optional name of configuration */
    name?: string;

    /** Optional description of configuration */
    description?: string;

    /**
     * Is the spell checker enabled
     * @default true
     */
    enabled?: boolean;

    /** list of words to be always considered correct */
    words?: string[];

    /** list of words to always be considered incorrect. */
    flagWords?: string[];

    /**
     * True to enable compound word checking.
     * @default false
     */
    allowCompoundWords?: boolean;

    /**
     * Words must match case rules.
     * @default false
     */
    caseSensitive?: boolean;

    /** Define additional available dictionaries */
    dictionaryDefinitions?: DictionaryDefinition[];

    /** Optional list of dictionaries to use. */
    dictionaries?: DictionaryId[];

    /**
     * List of RegExp patterns or Pattern names to exclude from spell checking
     *
     * Example: ["href"] - to exclude html href
     */
    ignoreRegExpList?: RegExpList;

    /**
     * List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
     * If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.
     */
    includeRegExpList?: RegExpList;

    /** Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList */
    patterns?: RegExpPatternDefinition[];
}

export type DictionaryFileTypes = 'S'|'W'|'C'|'T';

export type DictionaryDefinition = DictionaryDefinitionPreferred | DictionaryDefinitionAlternate | DictionaryDefinitionLegacy;

export interface DictionaryDefinitionBase {
    /** The reference name of the dictionary, used with program language settings */
    name: DictionaryId;
    /** Optional description */
    description?: string;
    /** Replacement pairs */
    repMap?: ReplaceMap;
    /** Use Compounds */
    useCompounds?: boolean;
}

export interface DictionaryDefinitionPreferred extends DictionaryDefinitionBase {
    /** Path to the file */
    path: FsPath;

    /** @hidden */
    file?: undefined;
}

export interface DictionaryDefinitionAlternate extends DictionaryDefinitionBase {
    /** @hidden */
    path?: undefined;

    /** Path to the file */
    file: FsPath;
}

/**
 * @deprecated
 * @hidden
 */
export interface DictionaryDefinitionLegacy extends DictionaryDefinitionBase {
    /** Path to the file, if undefined the path to the extension dictionaries is assumed */
    path?: FsPath;
    /** File name @deprecated use path */
    file: FsPath;
    /**
     * Type of file:
     * S - single word per line,
     * W - each line can contain one or more words separated by space,
     * C - each line is treated like code (Camel Case is allowed)
     * Default is S
     * C is the slowest to load due to the need to split each line based upon code splitting rules.
     * @default "S"
     */
    type?: DictionaryFileTypes;
}

export interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {
}

export interface LanguageSettingFilterFields {
    /** The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages */
    languageId: LanguageId | LanguageId[];
    /** The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales. */
    local?: LocaleId | LocaleId[];
}

export type RegExpList = PatternRef[];

/** A PatternRef is a Pattern or PatternId. */
export type PatternRef = Pattern | PatternId | PreDefinedPatterns;

/** @hidden */
type InternalRegExp = RegExp

export type Pattern = string | InternalRegExp;

export type PreDefinedPatterns =
    'Base64' |
    'CStyleComment' |
    'Email' |
    'EscapeCharacters' |
    'HexDigits' |
    'HexValues' |
    'href' |
    'PhpHereDoc' |
    'PublicKey' |
    'RsaCert' |
    'SHA' |
    'SpellCheckerDisable' |
    'string' |
    'Urls' |
    'Everything';

/** This matches the name in a pattern definition */
export type PatternId = string;

/** This matches the name in a dictionary definition */
export type DictionaryId = string;

/** This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc. */
export type LocaleId = string;

/**
 * @deprecatedMessage Use LocaleId instead
 */
export type LocalId = LocaleId;

/** These are glob expressions */
export type Glob = string;

/** This can be '*', 'typescript', 'cpp', 'json', etc. */
export type LanguageId = string;

/** A File System Path */
export type FsPath = string;

export interface RegExpPatternDefinition {
    /**
     * Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
     * It is possible to redefine one of the predefined patterns to override its value.
     */
    name: PatternId;
    /**
     * RegExp pattern
     */
    pattern: Pattern;
    /**
     * Description of the pattern.
     */
    description?: string;
}

export interface CSpellUserSettingsWithComments extends CSpellUserSettings {}

export interface Source {
    name: string;
    filename?: string;
    sources?: CSpellSettings[];
}
