export type ReplaceEntry = [string, string];
export type ReplaceMap = ReplaceEntry[];

/**
 * These settings come from user and workspace settings.
 */
export type CSpellPackageSettings = CSpellUserSettings;

export type CSpellUserSettings = CSpellSettings;

export interface CSpellSettings extends FileSettings, LegacySettings {
    $schema?: string;
}

export interface ImportFileRef {
    filename: string;
    error?: Error;
    referencedBy?: Source[];
}

export interface CSpellSettingsWithSourceTrace extends CSpellSettings {
    source?: Source;
    __importRef?: ImportFileRef;
    __imports?: Map<string, ImportFileRef>;
}

export interface FileSettings extends ExtendableSettings {
    /**
     * Configuration format version of the settings file.
     * @default "0.2"
     */
    version?: '0.2' | '0.1';

    /** Words to add to global dictionary -- should only be in the user config file. */
    userWords?: string[];

    /** Other settings files to be included */
    import?: FsPath | FsPath[];

    /**
     * The root to use for glop patterns found in this configuration.
     * Default: location of the configuration file.
     *   For compatibility reasons, config files with version 0.1, the glob root will
     *   default to be `${cwd}`.
     *
     * Use `globRoot` to define a different location.
     * `globRoot` can be relative to the location of this configuration file.
     * Defining globRoot, does not impact imported configurations.
     *
     * Special Values:
     * - `${cwd}` - will be replaced with the current working directory.
     * - `.` - will be the location of the containing configuration file.
     *
     */
    globRoot?: FsPath;

    /**
     * Glob patterns of files to be checked.
     * Glob patterns are relative to the `globRoot` of the configuration file that defines them.
     */
    files?: Glob[];

    /**
     * Glob patterns of files to be ignored
     * Glob patterns are relative to the `globRoot` of the configuration file that defines them.
     */
    ignorePaths?: Glob[];

    /**
     * Prevents searching for local configuration when checking individual documents.
     * @default false
     */
    noConfigSearch?: boolean;
}

export interface ExtendableSettings extends Settings {
    /** Overrides to apply based upon the file path. */
    overrides?: OverrideSettings[];
}

export interface Settings extends BaseSetting {
    /**
     * Current active spelling language.
     *
     * Example: "en-GB" for British English
     *
     * Example: "en,nl" to enable both English and Dutch
     * @default "en"
     */
    language?: LocaleId;

    /** list of words to be ignored */
    ignoreWords?: string[];

    /** languageIds for the files to spell check. */
    enabledLanguageIds?: LanguageIdSingle[];

    /**
     * @title File Types to Check
     * @scope resource
     * @uniqueItems true
     * @markdownDescription
     * Enable / Disable checking file types (languageIds).
     * These are in additional to the file types specified by `cSpell.enabledLanguageIds`.
     * To disable a language, prefix with `!` as in `!json`,
     *
     * Example:
     * ```
     * jsonc       // enable checking for jsonc
     * !json       // disable checking for json
     * kotlin      // enable checking for kotlin
     * ```
     */
    enableFiletypes?: LanguageIdSingle[];

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
     * List of RegExp patterns or Pattern names to exclude from spell checking.
     *
     * Example: ["href"] - to exclude html href
     */
    ignoreRegExpList?: RegExpPatternList;

    /**
     * List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
     * If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.
     */
    includeRegExpList?: RegExpPatternList;

    /** Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList */
    patterns?: RegExpPatternDefinition[];
}

export type DictionaryFileTypes = 'S' | 'W' | 'C' | 'T';

export type DictionaryDefinition =
    | DictionaryDefinitionPreferred
    | DictionaryDefinitionCustom
    | DictionaryDefinitionAlternate
    | DictionaryDefinitionLegacy;

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
    path: DictionaryPath;

    /**
     * Only for legacy dictionary definitions
     * @deprecated
     * @deprecatedMessage Use `path` instead.
     * @hidden
     */
    file?: undefined;
}

/**
 * Only for legacy dictionary definitions
 * @deprecated
 * @deprecatedMessage Use `DictionaryDefinitionPreferred`
 */
export interface DictionaryDefinitionAlternate extends DictionaryDefinitionBase {
    /** @hidden */
    path?: undefined;

    /**
     * Path to the file, only for legacy dictionary definitions
     * @deprecated
     * @deprecatedMessage Use `path` instead.
     */
    file: DictionaryPath;
}

/**
 * @deprecated
 * @hidden
 */
export interface DictionaryDefinitionLegacy extends DictionaryDefinitionBase {
    /** Path to the file, if undefined the path to the extension dictionaries is assumed */
    path?: FsPath;
    /**
     * File name
     * @deprecated
     * @deprecatedMessage Use path instead.
     */
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

/**
 * Specifies the scope of a dictionary.
 */
export type CustomDictionaryScope = 'user' | 'workspace' | 'folder';

/**
 * For Defining Custom dictionaries. They are generally scoped to a
 * `user`, `workspace`, or `folder`.
 * When `addWords` is true, indicates that the spell checker can add words
 * to the file.
 * Note: only plain text files with one word per line are supported at this moment.
 */
export interface DictionaryDefinitionCustom extends DictionaryDefinitionPreferred {
    /** Path to custom dictionary text file. */
    path: CustomDictionaryPath;

    /**
     * Defines the scope for when words will be added to the dictionary.
     * Scope values: `user`, `workspace`, `folder`
     */
    scope?: CustomDictionaryScope | CustomDictionaryScope[];

    /**
     * When `true`, let's the spell checker know that words can be added to this dictionary.
     */
    addWords: boolean;
}

export interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {}

export interface LanguageSettingFilterFields
    extends LanguageSettingFilterFieldsPreferred,
        LanguageSettingFilterFieldsDeprecated {}

export interface LanguageSettingFilterFieldsPreferred {
    /** The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages */
    languageId: LanguageId | LanguageIdSingle[];
    /** The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales. */
    locale?: LocaleId | LocaleId[];
}

export interface LanguageSettingFilterFieldsDeprecated {
    /** The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages */
    languageId: LanguageId | LanguageIdSingle[];
    /**
     * Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.
     * @deprecated
     * @deprecatedMessage Use `locale` instead
     */
    local?: LocaleId | LocaleId[];
}

/** @hidden */
type InternalRegExp = RegExp;

export type Pattern = string | InternalRegExp;

export type PredefinedPatterns =
    | 'Base64'
    | 'CStyleComment'
    | 'CStyleHexValue'
    | 'CSSHexValue'
    | 'CommitHash'
    | 'CommitHashLink'
    | 'Email'
    | 'EscapeCharacters'
    | 'HexValues'
    | 'href'
    | 'PhpHereDoc'
    | 'PublicKey'
    | 'RsaCert'
    | 'SHA'
    | 'SpellCheckerDisable'
    | 'SpellCheckerDisableBlock'
    | 'SpellCheckerDisableLine'
    | 'SpellCheckerDisableNext'
    | 'SpellCheckerIgnoreInDocSetting'
    | 'string'
    | 'UnicodeRef'
    | 'Urls'
    | 'UUID'
    | 'Everything';

/** This matches the name in a pattern definition */
export type PatternId = string;

/** A PatternRef is a Pattern or PatternId. */
export type PatternRef = Pattern | PatternId | PredefinedPatterns;

/** A list of pattern names or regular expressions */
export type RegExpPatternList = PatternRef[];

/** This matches the name in a dictionary definition */
export type DictionaryId = string;

/** This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc. */
export type LocaleId = string;

/**
 * @deprecated
 * @deprecatedMessage Use LocaleId instead
 */
export type LocalId = LocaleId;

/** These are glob expressions */
export type Glob = SimpleGlob | GlobDef;

/** Simple Glob string, the root will be globRoot */
export type SimpleGlob = string;

/**
 * Used to define fully qualified glob patterns.
 * It is currently hidden to make the json-schema a bit easier to use
 * when crafting cspell.json files by hand.
 * @hidden
 */
export interface GlobDef {
    /** Glob pattern to match */
    glob: string;

    /** Optional root to use when matching the glob. Defaults to current working dir. */
    root?: string;

    /** Optional source of the glob, used when merging settings to determine the origin. */
    source?: string;
}

/**
 * This can be '*', 'typescript', 'cpp', 'json', etc.
 * @pattern ^(!?[\w_\-\s]+)|(\*)$
 */
export type LanguageIdSingle = string;

/**
 * This can be 'typescript,cpp,json,literal haskell', etc.
 * @pattern ^([\w_\-\s]+)(,[\w_\-\s]+)*$
 */
export type LanguageIdMultiple = string;

/**
 * This can be 'typescript,cpp,json,literal haskell', etc.
 * @pattern ^(![\w_\-\s]+)(,![\w_\-\s]+)*$
 */
export type LanguageIdMultipleNeg = string;

export type LanguageId = LanguageIdSingle | LanguageIdMultiple | LanguageIdMultipleNeg;

/** A File System Path */
export type FsPath = string;

/**
 * A File System Path to a dictionary file.
 * @pattern ^.*\.(?:txt|trie)(?:\.gz)?$
 */
export type DictionaryPath = string;

/**
 * A File System Path to a dictionary file.
 * @pattern ^.*\.txt$
 */
export type CustomDictionaryPath = string;

export interface RegExpPatternDefinition {
    /**
     * Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
     * It is possible to redefine one of the predefined patterns to override its value.
     */
    name: PatternId;
    /**
     * RegExp pattern or array of RegExp patterns
     */
    pattern: Pattern | Pattern[];
    /**
     * Description of the pattern.
     */
    description?: string;
}

export type CSpellUserSettingsWithComments = CSpellUserSettings;

export interface Source {
    /** name of source */
    name: string;
    /** filename if this came from a file. */
    filename?: string;
    /** The two settings that were merged to */
    sources?: [CSpellSettings] | [CSpellSettings, CSpellSettings];
}
