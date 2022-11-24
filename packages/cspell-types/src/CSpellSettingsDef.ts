import type { DictionaryDefinition, DictionaryReference } from './DictionaryDefinition';
import type { Features } from './features';
import type { Parser, ParserName } from './Parser';
import type { Serializable } from './types';

/**
 * These settings come from user and workspace settings.
 */
export type CSpellPackageSettings = CSpellUserSettings;

export type CSpellUserSettings = CSpellSettings;

export interface CSpellSettings extends FileSettings, LegacySettings {}

export interface ImportFileRef {
    filename: string;
    error?: Error | undefined;
    referencedBy?: Source[];
}

export interface CSpellSettingsWithSourceTrace extends CSpellSettings {
    source?: Source | undefined;
    __importRef?: ImportFileRef;
    __imports?: Map<string, ImportFileRef>;
}

export interface AdvancedCSpellSettingsWithSourceTrace
    extends CSpellSettingsWithSourceTrace,
        ExperimentalFileSettings {}

export interface FileSettings extends ExtendableSettings, CommandLineSettings {
    /**
     * Url to JSON Schema
     * @default "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json"
     */
    $schema?: string;

    /**
     * Configuration format version of the settings file.
     *
     * This controls how the settings in the configuration file behave.
     *
     * @default "0.2"
     */
    version?: Version;

    /** Words to add to global dictionary -- should only be in the user config file. */
    userWords?: string[];

    /**
     * Allows this configuration to inherit configuration for one or more other files.
     *
     * See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.
     */
    import?: FsPath | FsPath[];

    /**
     * The root to use for glob patterns found in this configuration.
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
    globRoot?: FSPathResolvable;

    /**
     * Glob patterns of files to be checked.
     *
     * Glob patterns are relative to the `globRoot` of the configuration file that defines them.
     */
    files?: Glob[];

    /**
     * Enable scanning files and directories beginning with `.` (period).
     *
     * By default, CSpell does not scan `hidden` files.
     *
     * @default false
     */
    enableGlobDot?: boolean;

    /**
     * Glob patterns of files to be ignored.
     *
     * Glob patterns are relative to the `globRoot` of the configuration file that defines them.
     */
    ignorePaths?: Glob[];

    /**
     * Prevents searching for local configuration when checking individual documents.
     *
     * @default false
     */
    noConfigSearch?: boolean;

    /**
     * Indicate that the configuration file should not be modified.
     * This is used to prevent tools like the VS Code Spell Checker from
     * modifying the file to add words and other configuration.
     *
     * @default false
     */
    readonly?: boolean;

    /**
     * Custom reporters configuration.
     */
    reporters?: ReporterSettings[];

    /**
     * Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.
     * @default false
     */
    useGitignore?: boolean;

    /**
     * Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.
     */
    gitignoreRoot?: FsPath | FsPath[];

    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean;

    /**
     * Configure CSpell features.
     *
     * - Added with `v5.16.0`.
     */
    features?: Features;
}

/* eslint-disable no-irregular-whitespace */
/**
 * In the below JSDoc comment, we helpfully specify an example configuration for the end-user to
 * reference. And this example will get captured by the automatic documentation generator.
 *
 * However, specifying the glob pattern inside of a JSDoc is tricky, because the glob contains the
 * same symbol as the end-of-JSDoc symbol. To work around this, we insert a zero-width space in
 * between the "*" and the "/" symbols.
 */
export interface ExtendableSettings extends Settings {
    /**
     * Overrides are used to apply settings for specific files in your project.
     *
     * For example:
     *
     * ```javascript
     * "overrides": [
     *   // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
     *   {
     *     "filename": "**​/{*.hrr,*.crr}",
     *     "languageId": "cpp"
     *   },
     *   // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
     *   {
     *     "language": "nl",
     *     "filename": "**​/dutch/**​/*.txt"
     *   }
     * ]
     * ```
     */
    overrides?: OverrideSettings[];
}

export interface Settings extends ReportingConfiguration, BaseSetting, PnPSettings {
    /**
     * Current active spelling language. This specifies the language locale to use in choosing the
     * general dictionary.
     *
     * For example:
     *
     * - "en-GB" for British English.
     * - "en,nl" to enable both English and Dutch.
     *
     * @default "en"
     */
    language?: LocaleId;

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
     * Additional settings for individual languages.
     *
     * See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.
     */
    languageSettings?: LanguageSetting[];

    /** Forces the spell checker to assume a give language id. Used mainly as an Override. */
    languageId?: LanguageId;

    /**
     * By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
     * will prevent ALL default configuration from being loaded.
     *
     * @default true
     */
    loadDefaultConfiguration?: boolean;
}

export interface ReportingConfiguration extends SuggestionsConfiguration {
    /**
     * The maximum number of problems to report in a file.
     *
     * @default 100
     */
    maxNumberOfProblems?: number;

    /**
     * The maximum number of times the same word can be flagged as an error in a file.
     *
     * @default 5
     */
    maxDuplicateProblems?: number;

    /**
     * The minimum length of a word before checking it against a dictionary.
     *
     * @default 4
     */
    minWordLength?: number;
}

export interface SuggestionsConfiguration {
    /**
     * Number of suggestions to make.
     *
     * @default 10
     */
    numSuggestions?: number;

    /**
     * The maximum amount of time in milliseconds to generate suggestions for a word.
     *
     * @default 500
     */
    suggestionsTimeout?: number;

    /**
     * The maximum number of changes allowed on a word to be considered a suggestions.
     *
     * For example, appending an `s` onto `example` -> `examples` is considered 1 change.
     *
     * Range: between 1 and 5.
     *
     * @default 3
     */
    suggestionNumChanges?: number;
}

/**
 * Plug N Play settings to support package systems like Yarn 2.
 */
export interface PnPSettings {
    /**
     * Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
     * packages stored in the repository.
     *
     * When true, the spell checker will search up the directory structure for the existence
     * of a PnP file and load it.
     *
     * @default false
     */
    usePnP?: boolean;

    /**
     * The PnP files to search for. Note: `.mjs` files are not currently supported.
     *
     * @default [".pnp.js", ".pnp.cjs"]
     */
    pnpFiles?: string[];
}

/**
 * The Strategy to use to detect if a file has changed.
 * - `metadata` - uses the file system timestamp and size to detect changes (fastest).
 * - `content` - uses a hash of the file content to check file changes (slower - more accurate).
 */
export type CacheStrategy = 'metadata' | 'content';

export type CacheFormat = 'legacy' | 'universal';

export interface CacheSettings {
    /**
     * Store the results of processed files in order to only operate on the changed ones.
     * @default false
     */
    useCache?: boolean;

    // cspell:word cspellcache
    /**
     * Path to the cache location. Can be a file or a directory.
     * If none specified `.cspellcache` will be used.
     * Relative paths are relative to the config file in which it
     * is defined.
     *
     * A prefix of `${cwd}` is replaced with the current working directory.
     */
    cacheLocation?: FSPathResolvable;

    /**
     * Strategy to use for detecting changed files, default: metadata
     * @default 'metadata'
     */
    cacheStrategy?: CacheStrategy;

    /**
     * Format of the cache file.
     * - `legacy` - use absolute paths in the cache file
     * - `universal` - use a sharable format.
     * @default 'legacy'
     */
    cacheFormat?: CacheFormat | undefined;
}

/**
 * These are settings only used by the command line application.
 */
export interface CommandLineSettings {
    /**
     * Define cache settings.
     */
    cache?: CacheSettings;
    /**
     * Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)
     * @default false
     */
    failFast?: boolean;
}

/**
 * To prevent the unwanted execution of untrusted code, WorkspaceTrustSettings
 * are use to set the trust levels.
 *
 * Trust setting have an impact on both `cspell.config.js` files and on `.pnp.js` files.
 * In an untrusted location, these files will NOT be used.
 *
 * This will also prevent any associated plugins from being loaded.
 */
export interface WorkspaceTrustSettings {
    /**
     * Glob patterns of locations that contain ALWAYS trusted files.
     */
    trustedFiles?: Glob[];

    /**
     * Glob patterns of locations that contain NEVER trusted files.
     */
    untrustedFiles?: Glob[];

    /**
     * Sets the default trust level.
     * @default "trusted"
     */
    trustLevel?: TrustLevel;
}

/**
 * VS Code Spell Checker Settings.
 * To be Removed.
 * @deprecated true
 */
export interface LegacySettings {
    /**
     * Show status.
     * @deprecated true
     */
    showStatus?: boolean;

    /**
     * Delay in ms after a document has changed before checking it for spelling errors.
     * @deprecated true
     */
    spellCheckDelayMs?: number;
    /************************/
}

export interface OverrideSettings extends Settings, OverrideFilterFields {
    /** Sets the programming language id. */
    languageId?: LanguageId;

    /** Sets the locale. */
    language?: LocaleId;
}

export interface OverrideFilterFields {
    /** Glob pattern or patterns to match against. */
    filename: Glob | Glob[];
}

export interface BaseSetting extends ExperimentalBaseSettings {
    /** Optional identifier. */
    id?: string;

    /** Optional name of configuration. */
    name?: string;

    /** Optional description of configuration. */
    description?: string;

    /**
     * Is the spell checker enabled.
     * @default true
     */
    enabled?: boolean;

    /** List of words to be always considered correct. */
    words?: string[];

    /** List of words to always be considered incorrect. */
    flagWords?: string[];

    /**
     * List of words to be ignored. An ignored word will not show up as an error, even if it is
     * also in the `flagWords`.
     */
    ignoreWords?: string[];

    /**
     * True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
     *
     * @default false
     */
    allowCompoundWords?: boolean;

    /**
     * Determines if words must match case and accent rules.
     *
     * - `false` - Case is ignored and accents can be missing on the entire word.
     *   Incorrect accents or partially missing accents will be marked as incorrect.
     * - `true` - Case and accents are enforced.
     *
     * @default false
     */
    caseSensitive?: boolean;

    /**
     * Define additional available dictionaries.
     *
     * For example, you can use the following to add a custom dictionary:
     *
     * ```json
     * "dictionaryDefinitions": [
     *   { "name": "custom-words", "path": "./custom-words.txt"}
     * ],
     * "dictionaries": ["custom-words"]
     * ```
     */
    dictionaryDefinitions?: DictionaryDefinition[];

    /**
     * Optional list of dictionaries to use. Each entry should match the name of the dictionary.
     *
     * To remove a dictionary from the list, add `!` before the name.
     *
     * For example, `!typescript` will turn off the dictionary with the name `typescript`.
     *
     * See the [Dictionaries](https://cspell.org/docs/dictionaries/)
     * and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.
     */
    dictionaries?: DictionaryReference[];

    /**
     * Optional list of dictionaries that will not be used for suggestions.
     * Words in these dictionaries are considered correct, but will not be
     * used when making spell correction suggestions.
     *
     * Note: if a word is suggested by another dictionary, but found in
     * one of these dictionaries, it will be removed from the set of
     * possible suggestions.
     */
    noSuggestDictionaries?: DictionaryReference[];

    /**
     * List of regular expression patterns or pattern names to exclude from spell checking.
     *
     * Example: ["href"] - to exclude html href.
     *
     * By default, several patterns are excluded. See
     * [Configuration](https://cspell.org/configuration/#cspelljson-sections) for more details.
     *
     * While you can create your own patterns, you can also leverage several patterns that are
     * [built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).
     */
    ignoreRegExpList?: RegExpPatternList;

    /**
     * List of regular expression patterns or defined pattern names to match for spell checking.
     *
     * If this property is defined, only text matching the included patterns will be checked.
     *
     * While you can create your own patterns, you can also leverage several patterns that are
     * [built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).
     */
    includeRegExpList?: RegExpPatternList;

    /**
     * Defines a list of patterns that can be used with the `ignoreRegExpList` and
     * `includeRegExpList` options.
     *
     * For example:
     *
     * ```javascript
     * "ignoreRegExpList": ["comments"],
     * "patterns": [
     *   {
     *     "name": "comment-single-line",
     *     "pattern": "/#.*​/g"
     *   },
     *   {
     *     "name": "comment-multi-line",
     *     "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
     *   },
     *   // You can also combine multiple named patterns into one single named pattern
     *   {
     *     "name": "comments",
     *     "pattern": ["comment-single-line", "comment-multi-line"]
     *   }
     * ]
     * ```
     */
    patterns?: RegExpPatternDefinition[];
}

export interface LanguageSetting extends LanguageSettingFilterFields, BaseSetting {}

export interface LanguageSettingFilterFields
    extends LanguageSettingFilterFieldsPreferred,
        LanguageSettingFilterFieldsDeprecated {}

export interface LanguageSettingFilterFieldsPreferred {
    /** The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages. */
    languageId: LanguageId | LanguageIdSingle[];
    /** The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales. */
    locale?: LocaleId | LocaleId[];
}

export interface LanguageSettingFilterFieldsDeprecated {
    /** The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages. */
    languageId: LanguageId | LanguageIdSingle[];
    /**
     * Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.
     * @deprecated true
     * @deprecationMessage Use `locale` instead.
     */
    local?: LocaleId | LocaleId[];
}

/** @hidden */
type InternalRegExp = RegExp;

export type Pattern = string | InternalRegExp;

export type PredefinedPatterns =
    | 'Base64'
    | 'Base64MultiLine'
    | 'Base64SingleLine'
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
    | 'SshRsa'
    | 'SHA'
    | 'HashStrings'
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

/** This matches the name in a pattern definition. */
export type PatternId = string;

/** A PatternRef is a Pattern or PatternId. */
export type PatternRef = Pattern | PatternId | PredefinedPatterns;

/** A list of pattern names or regular expressions. */
export type RegExpPatternList = PatternRef[];

/** This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc. */
export type LocaleId = string;

/**
 * Configuration File Version.
 */
export type VersionLatest = '0.2';

/**
 * Legacy Configuration File Versions.
 * @deprecated true
 * @deprecationMessage Use `0.2` instead.
 */
export type VersionLegacy = '0.1';

export type Version = VersionLatest | VersionLegacy;

/**
 * @deprecated true
 * @deprecationMessage Use `LocaleId` instead.
 */
export type LocalId = LocaleId;

/** These are glob expressions. */
export type Glob = SimpleGlob | GlobDef;

/** Simple Glob string, the root will be globRoot. */
export type SimpleGlob = string;

/**
 * Used to define fully qualified glob patterns.
 * It is currently hidden to make the json-schema a bit easier to use
 * when crafting cspell.json files by hand.
 * @hidden
 */
export interface GlobDef {
    /** Glob pattern to match. */
    glob: string;

    /** Optional root to use when matching the glob. Defaults to current working dir. */
    root?: string;

    /**
     * Optional source of the glob, used when merging settings to determine the origin.
     * @hidden
     */
    source?: string;
}

/**
 * This can be '*', 'typescript', 'cpp', 'json', etc.
 * @pattern ^(!?[-\w_\s]+)|(\*)$
 */
export type LanguageIdSingle = string;

/**
 * This can be 'typescript,cpp,json,literal haskell', etc.
 * @pattern ^([-\w_\s]+)(,[-\w_\s]+)*$
 */
export type LanguageIdMultiple = string;

/**
 * This can be 'typescript,cpp,json,literal haskell', etc.
 * @pattern ^(![-\w_\s]+)(,![-\w_\s]+)*$
 */
export type LanguageIdMultipleNeg = string;

export type LanguageId = LanguageIdSingle | LanguageIdMultiple | LanguageIdMultipleNeg;

/**
 * A File System Path. Relative paths are relative to the configuration file.
 */
export type FsPath = string;

/**
 * A File System Path.
 *
 * Special Properties:
 * - `${cwd}` prefix - will be replaced with the current working directory.
 * - Relative paths are relative to the configuration file.
 */
export type FSPathResolvable = FsPath;

/** Trust Security Level. */
export type TrustLevel = 'trusted' | 'untrusted';

export interface RegExpPatternDefinition {
    /**
     * Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
     * It is possible to redefine one of the predefined patterns to override its value.
     */
    name: PatternId;
    /**
     * RegExp pattern or array of RegExp patterns.
     */
    pattern: Pattern | Pattern[];
    /**
     * Description of the pattern.
     */
    description?: string | undefined;
}

export type CSpellUserSettingsWithComments = CSpellUserSettings;

// Remove BaseSource from the Source list when the code is ready.
export type Source = FileSource | MergeSource | InMemorySource | BaseSource;

export interface FileSource extends BaseSource {
    /** Name of source. */
    name: string;
    /** Filename if this came from a file. */
    filename: string;
    /** The two settings that were merged to. */
    sources?: undefined;
    /** The configuration read. */
    fileSource: CSpellSettings;
}

export interface MergeSource extends BaseSource {
    /** Name of source. */
    name: string;
    /** Filename if this came from a file. */
    filename?: undefined;
    /** The two settings that were merged to. */
    sources: [CSpellSettings] | [CSpellSettings, CSpellSettings];
    /** The configuration read. */
    fileSource?: undefined;
}

export interface InMemorySource extends BaseSource {
    /** Name of source. */
    name: string;
    /** Filename if this came from a file. */
    filename?: undefined;
    /** The two settings that were merged to. */
    sources?: undefined;
    /** The configuration read. */
    fileSource?: undefined;
}

interface BaseSource {
    /** Name of source. */
    name: string;
    /** Filename if this came from a file. */
    filename?: string | undefined;
    /** The two settings that were merged to. */
    sources?: [CSpellSettings] | [CSpellSettings, CSpellSettings] | undefined;
    /** The configuration read. */
    fileSource?: CSpellSettings | undefined;
}

/**
 * Reporter name or reporter name + reporter config.
 */
export type ReporterSettings = string | [string] | [string, Serializable];

/**
 * Experimental Configuration / Options
 *
 * This Configuration is subject to change without warning.
 * @experimental
 * @hidden
 */
export interface ExperimentalFileSettings {
    /**
     * Future Plugin support
     * @experimental
     * @version 6.2.0
     */
    plugins?: Plugin[];
}

/**
 * Extends CSpellSettings with ExperimentalFileSettings
 * @experimental
 * @hidden
 */
export interface AdvancedCSpellSettings extends CSpellSettings, ExperimentalFileSettings {}

/**
 * Experimental Configuration / Options
 *
 * This Configuration is subject to change without warning.
 * @experimental
 * @hidden
 */
export interface ExperimentalBaseSettings {
    /**
     * Parser to use for the file content
     * @experimental
     * @version 6.2.0
     */
    parser?: ParserName;
}

/**
 * Plugin API
 * @experimental
 * @version 6.2.0
 */
export interface Plugin {
    parsers?: Parser[];
}
