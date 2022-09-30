/// <reference types="node" />
import { Glob, CSpellSettingsWithSourceTrace, AdvancedCSpellSettingsWithSourceTrace, Parser, DictionaryDefinitionPreferred, DictionaryDefinitionAugmented, DictionaryDefinitionCustom, TextOffset, TextDocumentOffset, PnPSettings as PnPSettings$1, ImportFileRef, CSpellUserSettings, Issue, MappedText, ParsedText, LocaleId, CSpellSettings } from '@cspell/cspell-types';
export * from '@cspell/cspell-types';
import * as cspellDictModule from 'cspell-dictionary';
import { CachingDictionary, SpellingDictionaryCollection, SuggestionResult } from 'cspell-dictionary';
export { SpellingDictionary, SpellingDictionaryCollection, SuggestOptions, SuggestionCollector, SuggestionResult } from 'cspell-dictionary';
import { WeightMap } from 'cspell-trie-lib';
export { CompoundWordsMethod } from 'cspell-trie-lib';
export { asyncIterableToArray, readFile, readFileSync, writeToFile, writeToFileIterable, writeToFileIterableP } from 'cspell-io';
import { URI } from 'vscode-uri';

declare type ExclusionFunction = (fileUri: string) => boolean;
declare type FileExclusionFunction = (file: string) => boolean;
/** The structure of the VS Code search.exclude settings */
interface ExcludeFilesGlobMap {
    [glob: string]: boolean;
}
declare function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap): string[];
/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
declare function generateExclusionFunctionForUri(globs: Glob[], root: string, allowedSchemes?: Set<string>): ExclusionFunction;
/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
declare function generateExclusionFunctionForFiles(globs: Glob[], root: string): FileExclusionFunction;

type exclusionHelper_d_ExclusionFunction = ExclusionFunction;
type exclusionHelper_d_FileExclusionFunction = FileExclusionFunction;
type exclusionHelper_d_ExcludeFilesGlobMap = ExcludeFilesGlobMap;
declare const exclusionHelper_d_extractGlobsFromExcludeFilesGlobMap: typeof extractGlobsFromExcludeFilesGlobMap;
declare const exclusionHelper_d_generateExclusionFunctionForUri: typeof generateExclusionFunctionForUri;
declare const exclusionHelper_d_generateExclusionFunctionForFiles: typeof generateExclusionFunctionForFiles;
declare namespace exclusionHelper_d {
  export {
    exclusionHelper_d_ExclusionFunction as ExclusionFunction,
    exclusionHelper_d_FileExclusionFunction as FileExclusionFunction,
    exclusionHelper_d_ExcludeFilesGlobMap as ExcludeFilesGlobMap,
    exclusionHelper_d_extractGlobsFromExcludeFilesGlobMap as extractGlobsFromExcludeFilesGlobMap,
    exclusionHelper_d_generateExclusionFunctionForUri as generateExclusionFunctionForUri,
    exclusionHelper_d_generateExclusionFunctionForFiles as generateExclusionFunctionForFiles,
  };
}

interface ListGlobalImportsResult {
    filename: string;
    name: string | undefined;
    id: string | undefined;
    error: string | undefined;
    dictionaryDefinitions: CSpellSettingsWithSourceTrace['dictionaryDefinitions'];
    languageSettings: CSpellSettingsWithSourceTrace['languageSettings'];
    package: NodePackage | undefined;
}
interface ListGlobalImportsResults {
    list: ListGlobalImportsResult[];
    globalSettings: CSpellSettingsWithSourceTrace;
}
interface NodePackage {
    name: string | undefined;
    filename: string;
}
declare function listGlobalImports(): ListGlobalImportsResults;
interface AddPathsToGlobalImportsResults {
    success: boolean;
    resolvedSettings: ResolveSettingsResult[];
    error: string | undefined;
}
declare function addPathsToGlobalImports(paths: string[]): AddPathsToGlobalImportsResults;
interface RemovePathsFromGlobalImportsResult {
    success: boolean;
    error: string | undefined;
    removed: string[];
}
/**
 * Remove files from the global setting.
 * @param paths match against the partial file path, or package name, or id.
 *   To match against a partial file path, it must match against the subdirectory and filename.
 * Note: for Idempotent reasons, asking to remove a path that is not in the global settings is considered a success.
 *   It is possible to check for this by looking at the returned list of removed paths.
 */
declare function removePathsFromGlobalImports(paths: string[]): RemovePathsFromGlobalImportsResult;
interface ResolveSettingsResult {
    filename: string;
    resolvedToFilename: string | undefined;
    error?: string;
    settings: CSpellSettingsWithSourceTrace;
}

//# sourceMappingURL=index.link.d.ts.map

declare const index_link_d_addPathsToGlobalImports: typeof addPathsToGlobalImports;
declare const index_link_d_listGlobalImports: typeof listGlobalImports;
declare const index_link_d_removePathsFromGlobalImports: typeof removePathsFromGlobalImports;
type index_link_d_AddPathsToGlobalImportsResults = AddPathsToGlobalImportsResults;
type index_link_d_ListGlobalImportsResult = ListGlobalImportsResult;
type index_link_d_ListGlobalImportsResults = ListGlobalImportsResults;
type index_link_d_RemovePathsFromGlobalImportsResult = RemovePathsFromGlobalImportsResult;
type index_link_d_ResolveSettingsResult = ResolveSettingsResult;
declare namespace index_link_d {
  export {
    index_link_d_addPathsToGlobalImports as addPathsToGlobalImports,
    index_link_d_listGlobalImports as listGlobalImports,
    index_link_d_removePathsFromGlobalImports as removePathsFromGlobalImports,
    index_link_d_AddPathsToGlobalImportsResults as AddPathsToGlobalImportsResults,
    index_link_d_ListGlobalImportsResult as ListGlobalImportsResult,
    index_link_d_ListGlobalImportsResults as ListGlobalImportsResults,
    index_link_d_RemovePathsFromGlobalImportsResult as RemovePathsFromGlobalImportsResult,
    index_link_d_ResolveSettingsResult as ResolveSettingsResult,
  };
}

declare const createSpellingDictionary: typeof cspellDictModule.createSpellingDictionary;
declare const createCollection: typeof cspellDictModule.createCollection;

/**
 * The keys of an object where the values cannot be undefined.
 */
declare type OptionalKeys<T> = Exclude<{
    [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? never : P;
}[keyof T], undefined>;
/**
 * Allow undefined in optional fields
 */
declare type OptionalOrUndefined<T> = {
    [P in keyof T]: P extends OptionalKeys<T> ? T[P] | undefined : T[P];
};

declare const SymbolCSpellSettingsInternal: unique symbol;
interface CSpellSettingsInternal extends Omit<AdvancedCSpellSettingsWithSourceTrace, 'dictionaryDefinitions'> {
    [SymbolCSpellSettingsInternal]: true;
    dictionaryDefinitions?: DictionaryDefinitionInternal[];
}
interface CSpellSettingsInternalFinalized extends CSpellSettingsInternal {
    parserFn: Parser | undefined;
    finalized: true;
    ignoreRegExpList: RegExp[];
    includeRegExpList: RegExp[];
}
declare type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;
interface DictionaryDefinitionInternal extends Readonly<DictionaryDefinitionPreferred>, Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>, Readonly<DictionaryDefinitionAugmented> {
    /**
     * Optional weight map used to improve suggestions.
     */
    readonly weightMap?: WeightMap | undefined;
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
}

declare function refreshDictionaryCache(maxAge?: number): Promise<void>;

declare type LoadOptions = DictionaryDefinitionInternal;

declare class SpellingDictionaryLoadError extends Error {
    readonly uri: string;
    readonly options: LoadOptions;
    readonly cause: Error;
    readonly name: string;
    constructor(uri: string, options: LoadOptions, cause: Error, message: string);
}
declare function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError;

declare function stringToRegExp(pattern: string | RegExp, defaultFlags?: string, forceFlags?: string): RegExp | undefined;

declare function splitCamelCaseWordWithOffset(wo: TextOffset): Array<TextOffset>;
/**
 * Split camelCase words into an array of strings.
 */
declare function splitCamelCaseWord(word: string): string[];
/**
 * This function lets you iterate over regular expression matches.
 */
declare function match(reg: RegExp, text: string): Iterable<RegExpExecArray>;
declare function matchStringToTextOffset(reg: RegExp, text: string): Iterable<TextOffset>;
declare function matchToTextOffset(reg: RegExp, text: TextOffset): Iterable<TextOffset>;
declare function extractLinesOfText(text: string): Iterable<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
declare function extractWordsFromText(text: string): Iterable<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
declare function extractWordsFromTextOffset(text: TextOffset): Iterable<TextOffset>;
declare function cleanText(text: string): string;
declare function cleanTextOffset(text: TextOffset): TextOffset;
/**
 * Extract out whole words and words containing numbers from a string of text.
 */
declare function extractPossibleWordsFromTextOffset(text: TextOffset): Iterable<TextOffset>;
declare function extractWordsFromCode(text: string): Iterable<TextOffset>;
declare function extractWordsFromCodeTextOffset(textOffset: TextOffset): Iterable<TextOffset>;
declare function isUpperCase(word: string): boolean;
declare function isLowerCase(word: string): boolean;
declare function isFirstCharacterUpper(word: string): boolean;
declare function isFirstCharacterLower(word: string): boolean;
declare function ucFirst(word: string): string;
declare function lcFirst(word: string): string;
declare function snakeToCamel(word: string): string;
declare function camelToSnake(word: string): string;
declare function matchCase(example: string, word: string): string;
declare function textOffset(text: string, offset?: number): TextOffset;
declare function extractText(textOffset: TextOffset, startPos: number, endPos: number): string;
declare function calculateTextDocumentOffsets<T extends TextOffset>(uri: string, doc: string, wordOffsets: T[]): (TextDocumentOffset & T)[];
declare function removeAccents(text: string): string;
declare const __testing__: {
    regExWords: RegExp;
    regExWordsAndDigits: RegExp;
};

declare const text_d_splitCamelCaseWordWithOffset: typeof splitCamelCaseWordWithOffset;
declare const text_d_splitCamelCaseWord: typeof splitCamelCaseWord;
declare const text_d_match: typeof match;
declare const text_d_matchStringToTextOffset: typeof matchStringToTextOffset;
declare const text_d_matchToTextOffset: typeof matchToTextOffset;
declare const text_d_extractLinesOfText: typeof extractLinesOfText;
declare const text_d_extractWordsFromText: typeof extractWordsFromText;
declare const text_d_extractWordsFromTextOffset: typeof extractWordsFromTextOffset;
declare const text_d_cleanText: typeof cleanText;
declare const text_d_cleanTextOffset: typeof cleanTextOffset;
declare const text_d_extractPossibleWordsFromTextOffset: typeof extractPossibleWordsFromTextOffset;
declare const text_d_extractWordsFromCode: typeof extractWordsFromCode;
declare const text_d_extractWordsFromCodeTextOffset: typeof extractWordsFromCodeTextOffset;
declare const text_d_isUpperCase: typeof isUpperCase;
declare const text_d_isLowerCase: typeof isLowerCase;
declare const text_d_isFirstCharacterUpper: typeof isFirstCharacterUpper;
declare const text_d_isFirstCharacterLower: typeof isFirstCharacterLower;
declare const text_d_ucFirst: typeof ucFirst;
declare const text_d_lcFirst: typeof lcFirst;
declare const text_d_snakeToCamel: typeof snakeToCamel;
declare const text_d_camelToSnake: typeof camelToSnake;
declare const text_d_matchCase: typeof matchCase;
declare const text_d_textOffset: typeof textOffset;
declare const text_d_extractText: typeof extractText;
declare const text_d_calculateTextDocumentOffsets: typeof calculateTextDocumentOffsets;
declare const text_d_removeAccents: typeof removeAccents;
declare const text_d___testing__: typeof __testing__;
declare const text_d_stringToRegExp: typeof stringToRegExp;
declare namespace text_d {
  export {
    text_d_splitCamelCaseWordWithOffset as splitCamelCaseWordWithOffset,
    text_d_splitCamelCaseWord as splitCamelCaseWord,
    text_d_match as match,
    text_d_matchStringToTextOffset as matchStringToTextOffset,
    text_d_matchToTextOffset as matchToTextOffset,
    text_d_extractLinesOfText as extractLinesOfText,
    text_d_extractWordsFromText as extractWordsFromText,
    text_d_extractWordsFromTextOffset as extractWordsFromTextOffset,
    text_d_cleanText as cleanText,
    text_d_cleanTextOffset as cleanTextOffset,
    text_d_extractPossibleWordsFromTextOffset as extractPossibleWordsFromTextOffset,
    text_d_extractWordsFromCode as extractWordsFromCode,
    text_d_extractWordsFromCodeTextOffset as extractWordsFromCodeTextOffset,
    text_d_isUpperCase as isUpperCase,
    text_d_isLowerCase as isLowerCase,
    text_d_isFirstCharacterUpper as isFirstCharacterUpper,
    text_d_isFirstCharacterLower as isFirstCharacterLower,
    text_d_ucFirst as ucFirst,
    text_d_lcFirst as lcFirst,
    text_d_snakeToCamel as snakeToCamel,
    text_d_camelToSnake as camelToSnake,
    text_d_matchCase as matchCase,
    text_d_textOffset as textOffset,
    text_d_extractText as extractText,
    text_d_calculateTextDocumentOffsets as calculateTextDocumentOffsets,
    text_d_removeAccents as removeAccents,
    text_d___testing__ as __testing__,
    text_d_stringToRegExp as stringToRegExp,
  };
}

interface FeatureFlag {
    name: string;
    description: string;
}
declare type FlagTypes = string | boolean;
/**
 * Feature Flags are used to turn on/off features.
 * These are primarily used before a feature has been fully released.
 */
declare class FeatureFlags {
    private flags;
    private flagValues;
    constructor(flags?: FeatureFlag[]);
    register(flag: FeatureFlag): this;
    register(name: string, description: string): this;
    getFlag(flag: string): FlagTypes | undefined;
    getFlagBool(flag: string): boolean | undefined;
    setFlag(flag: string, value?: FlagTypes): this;
    getFlagInfo(flag: string): FeatureFlag | undefined;
    getFlags(): FeatureFlag[];
    getFlagValues(): Map<string, FlagTypes>;
    reset(): this;
}
declare class UnknownFeatureFlagError extends Error {
    readonly flag: string;
    constructor(flag: string);
}
declare function getSystemFeatureFlags(): FeatureFlags;

declare type LanguageId = string;
declare function getLanguagesForExt(ext: string): string[];
declare function getLanguagesForBasename(basename: string): string[];

declare type DocumentUri = URI;
interface Position {
    line: number;
    character: number;
}
/**
 * Range offset tuple.
 */
declare type SimpleRange$1 = [start: number, end: number];
interface TextDocumentLine {
    readonly text: string;
    readonly offset: number;
    readonly position: Position;
}
/**
 * A simple text document. Not to be implemented. The document keeps the content
 * as string.
 */
interface TextDocument {
    /**
     * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
     * represent files on disk. However, some documents may have other schemes indicating that they are not
     * available on disk.
     */
    readonly uri: DocumentUri;
    /**
     * The identifier of the language associated with this document.
     */
    readonly languageId: string | string[];
    /**
     * The version number of this document (it will increase after each
     * change, including undo/redo).
     */
    readonly version: number;
    /**
     * the raw Document Text
     */
    readonly text: string;
    /**
     * The natural language locale.
     */
    readonly locale?: string | undefined;
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
    lineAt(offset: number): TextDocumentLine;
    getLine(lineNum: number): TextDocumentLine;
    getLines(): Iterable<TextDocumentLine>;
}
interface CreateTextDocumentParams {
    uri: DocumentUri | string;
    content: string;
    languageId?: string | string[] | undefined;
    locale?: string | undefined;
    version?: number | undefined;
}
interface TextDocumentContentChangeEvent {
    range?: SimpleRange$1;
    text: string;
}
declare function createTextDocument({ uri, content, languageId, locale, version, }: CreateTextDocumentParams): TextDocument;
declare function updateTextDocument(doc: TextDocument, edits: TextDocumentContentChangeEvent[], version?: number): TextDocument;

/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */

declare type LoaderResult = URI | undefined;

declare type CSpellSettingsWST$1 = CSpellSettingsWithSourceTrace;
declare type CSpellSettingsI$1 = CSpellSettingsInternal;
declare type PnPSettings = OptionalOrUndefined<PnPSettings$1>;
declare const sectionCSpell = "cSpell";
declare const defaultFileName = "cspell.json";
declare const defaultConfigFilenames: readonly string[];
declare function searchForConfig(searchFrom: string | undefined, pnpSettings?: PnPSettings): Promise<CSpellSettingsI$1 | undefined>;
/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
declare function loadConfig(file: string, pnpSettings?: PnPSettings): Promise<CSpellSettingsI$1>;
declare function loadPnP(pnpSettings: PnPSettings, searchFrom: URI): Promise<LoaderResult>;
declare function loadPnPSync(pnpSettings: PnPSettings, searchFrom: URI): LoaderResult;
declare function readRawSettings(filename: string, relativeTo?: string): CSpellSettingsWST$1;
/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */
declare function readSettingsFiles(filenames: string[]): CSpellSettingsI$1;
declare function getGlobalSettings(): CSpellSettingsI$1;
declare function getCachedFileSize(): number;
declare function clearCachedSettingsFiles(): void;

declare function extractImportErrors(settings: CSpellSettingsWST$1): ImportFileRefWithError$1[];
interface ImportFileRefWithError$1 extends ImportFileRef {
    error: Error;
}

/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to the current working directory)
 *   - package `@cspell/dict-typescript/cspell-ext.json`
 */
declare function readSettings(filename: string): CSpellSettingsI$1;
declare function readSettings(filename: string, defaultValues: CSpellSettingsWST$1): CSpellSettingsI$1;
/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to `relativeTo`)
 *   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
 * @param relativeTo - absolute path to start searching for relative files or node_modules.
 */
declare function readSettings(filename: string, relativeTo: string): CSpellSettingsI$1;
declare function readSettings(filename: string, relativeTo: string, defaultValues: CSpellSettingsWST$1): CSpellSettingsI$1;

declare type CSpellSettingsWST = AdvancedCSpellSettingsWithSourceTrace;
declare type CSpellSettingsWSTO = OptionalOrUndefined<AdvancedCSpellSettingsWithSourceTrace>;
declare type CSpellSettingsI = CSpellSettingsInternal;
declare function mergeSettings(left: CSpellSettingsWSTO | CSpellSettingsI, ...settings: (CSpellSettingsWSTO | CSpellSettingsI | undefined)[]): CSpellSettingsI;
declare function mergeInDocSettings(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): CSpellSettingsWST;
declare function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI;
/**
 *
 * @param settings - settings to finalize
 * @returns settings where all globs and file paths have been resolved.
 */
declare function finalizeSettings(settings: CSpellSettingsWSTO | CSpellSettingsI): CSpellSettingsInternalFinalized;
/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 * @deprecated true
 * @deprecationMessage No longer actively supported. Use package: `cspell-glob`.
 */
declare function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean;
/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings the settings to search
 */
declare function getSources(settings: CSpellSettingsWSTO): CSpellSettingsWSTO[];
interface ImportFileRefWithError extends ImportFileRef {
    error: Error;
}
interface ConfigurationDependencies {
    configFiles: string[];
    dictionaryFiles: string[];
}
declare function extractDependencies(settings: CSpellSettingsWSTO | CSpellSettingsI): ConfigurationDependencies;

declare const currentSettingsFileVersion = "0.2";
declare const ENV_CSPELL_GLOB_ROOT = "CSPELL_GLOB_ROOT";

declare function getDefaultSettings(useDefaultDictionaries?: boolean): CSpellSettingsInternal;
declare function getDefaultBundledSettings(): CSpellSettingsInternal;

declare class ImportError extends Error {
    readonly cause: Error | undefined;
    constructor(msg: string, cause?: Error | unknown);
}

declare function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string, languageId: string | string[]): CSpellSettingsInternal;

interface MatchRange {
    startPos: number;
    endPos: number;
}

declare type TextOffsetRO = Readonly<TextOffset>;
interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    flagWords?: string[];
    allowCompoundWords?: boolean;
    /** ignore case when checking words against dictionary or ignore words list */
    ignoreCase: boolean;
}
interface IncludeExcludeOptions {
    ignoreRegExpList?: RegExp[];
    includeRegExpList?: RegExp[];
}
interface ValidationResult extends TextOffset, Pick<Issue, 'message' | 'issueType'> {
    line: TextOffset;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}
declare type LineValidatorFn = (line: LineSegment) => Iterable<ValidationResult>;
interface LineSegment {
    line: TextOffsetRO;
    segment: TextOffsetRO;
}
interface MappedTextValidationResult extends MappedText {
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}
declare type TextValidatorFn = (text: MappedText) => Iterable<MappedTextValidationResult>;

interface LineValidator {
    fn: LineValidatorFn;
    dict: CachingDictionary;
}
interface TextValidator {
    validate: TextValidatorFn;
    lineValidator: LineValidator;
}

interface ValidationIssue extends ValidationResult {
    suggestions?: string[];
}
interface ValidateTextOptions {
    /**
     * Generate suggestions where there are spelling issues.
     */
    generateSuggestions?: boolean;
    /**
     * The number of suggestions to generate. The higher the number the longer it takes.
     */
    numSuggestions?: number;
    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean;
}
/**
 * @deprecated
 * @deprecationMessage Use spellCheckDocument
 */
declare function validateText(text: string, settings: CSpellUserSettings, options?: ValidateTextOptions): Promise<ValidationIssue[]>;

declare type Offset = number;
declare type SimpleRange = readonly [Offset, Offset];

interface DocumentValidatorOptions extends ValidateTextOptions {
    /**
     * Optional path to a configuration file.
     * If given, it will be used instead of searching for a configuration file.
     */
    configFile?: string;
    /**
     * Prevents searching for local configuration files
     * By default the spell checker looks for configuration files
     * starting at the location of given filename.
     * If `configFile` is defined it will still be loaded instead of searching.
     * `false` will override the value in `settings.noConfigSearch`.
     * @defaultValue undefined
     */
    noConfigSearch?: boolean;
}
declare class DocumentValidator {
    readonly options: DocumentValidatorOptions;
    readonly settings: CSpellUserSettings;
    private _document;
    private _ready;
    readonly errors: Error[];
    private _prepared;
    private _preparations;
    private _preparationTime;
    private _suggestions;
    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, options: DocumentValidatorOptions, settings: CSpellUserSettings);
    get ready(): boolean;
    prepareSync(): void;
    prepare(): Promise<void>;
    private _prepareAsync;
    private _updatePrep;
    /**
     * The amount of time in ms to prepare for validation.
     */
    get prepTime(): number;
    get validateDirectives(): boolean;
    checkText(range: SimpleRange, _text: string, scope: string[]): ValidationIssue[];
    check(parsedText: ParsedText): ValidationIssue[];
    /**
     * Check a Document for Validation Issues.
     * @param forceCheck - force a check even if the document would normally be excluded.
     * @returns the validation issues.
     */
    checkDocumentAsync(forceCheck?: boolean): Promise<ValidationIssue[]>;
    /**
     * Check a Document for Validation Issues.
     *
     * Note: The validator must be prepared before calling this method.
     * @param forceCheck - force a check even if the document would normally be excluded.
     * @returns the validation issues.
     */
    checkDocument(forceCheck?: boolean): ValidationIssue[];
    checkDocumentDirectives(forceCheck?: boolean): ValidationIssue[];
    get document(): TextDocument;
    updateDocumentText(text: string): void;
    private defaultParser;
    private _checkParsedText;
    private addPossibleError;
    private catchError;
    private errorCatcherWrapper;
    private _parse;
    private suggest;
    private genSuggestions;
    getFinalizedDocSettings(): CSpellSettingsInternal;
    /**
     * Returns true if the final result of the configuration calculation results
     * in the document being enabled. Note: in some cases, checking the document
     * might still make sense, for example, the `@cspell/eslint-plugin` relies on
     * `eslint` configuration to make that determination.
     * @returns true if the document settings have resolved to be `enabled`
     */
    shouldCheckDocument(): boolean;
    /**
     * Internal `cspell-lib` use.
     */
    _getPreparations(): Preparations | undefined;
}
interface Preparations {
    /** loaded config */
    config: CSpellSettingsInternal;
    dictionary: SpellingDictionaryCollection;
    /** configuration after applying in-doc settings */
    docSettings: CSpellSettingsInternal;
    finalSettings: CSpellSettingsInternalFinalized;
    includeRanges: MatchRange[];
    textValidator: TextValidator;
    segmenter: (texts: MappedText) => Iterable<MappedText>;
    shouldCheck: boolean;
    validateOptions: ValidationOptions;
    localConfig: CSpellUserSettings | undefined;
    localConfigFilepath: string | undefined;
}

/**
 * Annotate text with issues and include / exclude zones.
 * @param text - the text to annotate.
 * @param settings - the settings to use.
 * @returns the Check Text result
 * @deprecated
 */
declare function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo>;
interface CheckTextInfo {
    text: string;
    items: TextInfoItem[];
}
interface TextInfoItem {
    text: string;
    startPos: number;
    endPos: number;
    flagIE: IncludeExcludeFlag;
    isError?: boolean;
}
declare enum IncludeExcludeFlag {
    INCLUDE = "I",
    EXCLUDE = "E"
}
interface CheckTextOptions extends DocumentValidatorOptions {
}
/**
 * Calculate document issues and include / exclude zones.
 * @param doc - document to check
 * @param options - check options
 * @param settings - optional settings
 * @returns
 */
declare function checkTextDocument(doc: TextDocument | Document, options: CheckTextOptions, settings?: CSpellUserSettings): Promise<CheckTextInfo>;

interface SpellCheckFileOptions extends ValidateTextOptions {
    /**
     * Optional path to a configuration file.
     * If given, it will be used instead of searching for a configuration file.
     */
    configFile?: string;
    /**
     * File encoding
     * @defaultValue 'utf-8'
     */
    encoding?: BufferEncoding;
    /**
     * Prevents searching for local configuration files
     * By default the spell checker looks for configuration files
     * starting at the location of given filename.
     * If `configFile` is defined it will still be loaded instead of searching.
     * `false` will override the value in `settings.noConfigSearch`.
     * @defaultValue undefined
     */
    noConfigSearch?: boolean;
}
interface SpellCheckFileResult {
    document: Document | DocumentWithText;
    settingsUsed: CSpellSettingsWithSourceTrace;
    localConfigFilepath: string | undefined;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
    errors: Error[] | undefined;
}
declare type UriString = string;
interface DocumentWithText extends Document {
    text: string;
}
interface Document {
    uri: UriString;
    text?: string;
    languageId?: string;
    locale?: string;
}
/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
declare function spellCheckFile(file: string, options: SpellCheckFileOptions, settings: CSpellUserSettings): Promise<SpellCheckFileResult>;
/**
 * Spell Check a Document.
 * @param document - document to be checked. If `document.text` is `undefined` the file will be loaded
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
declare function spellCheckDocument(document: Document | DocumentWithText, options: SpellCheckFileOptions, settings: CSpellUserSettings): Promise<SpellCheckFileResult>;
interface DetermineFinalDocumentSettingsResult {
    document: DocumentWithText;
    settings: CSpellSettingsWithSourceTrace;
}
/**
 * Combines all relevant setting values into a final configuration to be used for spell checking.
 * It applies any overrides and appropriate language settings by taking into account the document type (languageId)
 * the locale (natural language) and any in document settings.
 *
 * Note: this method will not search for configuration files. Configuration files should already be merged into `settings`.
 * It is NOT necessary to include the cspell defaultSettings or globalSettings. They will be applied within this function.
 * @param document - The document to be spell checked. Note: if the URI doesn't have a path, overrides cannot be applied.
 *   `locale` - if defined will be used unless it is overridden by an in-document setting.
 *   `languageId` - if defined will be used to select appropriate file type dictionaries.
 * @param settings - The near final settings. Should already be the combination of all configuration files.
 */
declare function determineFinalDocumentSettings(document: DocumentWithText, settings: CSpellUserSettings): DetermineFinalDocumentSettingsResult;
declare function isBinaryFile(filenameUri: URI, languageId?: string | string[]): boolean;
declare function fileToDocument(file: string): Document;
declare function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
declare function fileToDocument(file: string, text?: string, languageId?: string, locale?: string): Document | DocumentWithText;
declare function fileToTextDocument(file: string): Promise<TextDocument>;

interface SuggestedWordBase extends SuggestionResult {
    dictionaries: string[];
}
interface SuggestedWord extends SuggestedWordBase {
    noSuggest: boolean;
    forbidden: boolean;
}
interface SuggestionsForWordResult {
    word: string;
    suggestions: SuggestedWord[];
}
interface SuggestionOptions {
    /**
     * languageId to use when determining file type.
     */
    languageId?: LanguageId | LanguageId[];
    /**
     * Locale to use.
     */
    locale?: LocaleId;
    /**
     * Strict case and accent checking
     * @default true
     */
    strict?: boolean;
    /**
     * List of dictionaries to use. If specified, only that list of dictionaries will be used.
     */
    dictionaries?: string[];
    /**
     * The number of suggestions to make.
     * @default 8
     */
    numSuggestions?: number;
    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     * @default 4
     */
    numChanges?: number;
    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default true
     */
    includeTies?: boolean;
    /**
     * By default we want to use the default configuration, but there are cases
     * where someone might not want that.
     * @default true
     */
    includeDefaultConfig?: boolean;
}
declare function suggestionsForWords(words: Iterable<string> | AsyncIterable<string>, options?: SuggestionOptions, settings?: CSpellSettings): AsyncIterable<SuggestionsForWordResult>;
declare function suggestionsForWord(word: string, options?: SuggestionOptions, settings?: CSpellSettings): Promise<SuggestionsForWordResult>;
declare class SuggestionError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}

interface TraceResult {
    word: string;
    found: boolean;
    foundWord: string | undefined;
    forbidden: boolean;
    noSuggest: boolean;
    dictName: string;
    dictSource: string;
    dictActive: boolean;
    configSource: string;
    errors: Error[] | undefined;
}
interface TraceOptions {
    languageId?: LanguageId | LanguageId[];
    locale?: LocaleId;
    ignoreCase?: boolean;
    allowCompoundWords?: boolean;
}
declare function traceWords(words: string[], settings: CSpellSettings, options: TraceOptions | undefined): Promise<TraceResult[]>;
declare function traceWordsAsync(words: Iterable<string> | AsyncIterable<string>, settings: CSpellSettings, options: TraceOptions | undefined): AsyncIterableIterator<TraceResult[]>;

declare type Console = typeof console;
interface Logger {
    log: Console['log'];
    warn: Console['warn'];
    error: Console['error'];
}
/**
 * Set the global cspell-lib logger
 * @param logger - a logger like `console`
 * @returns the old logger.
 */
declare function setLogger(logger: Logger): Logger;
/**
 * Get the current cspell-lib logger.
 * @returns the current logger.
 */
declare function getLogger(): Logger;

interface ResolveFileResult {
    filename: string;
    relativeTo: string | undefined;
    found: boolean;
}
/**
 * Resolve filename to absolute paths.
 * It tries to look for local files as well as node_modules
 * @param filename an absolute path, relative path, `~` path, or a node_module.
 * @param relativeTo absolute path
 */
declare function resolveFile(filename: string, relativeTo: string): ResolveFileResult;

declare function clearCachedFiles(): Promise<void>;
declare function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection>;

export { CheckTextInfo, ConfigurationDependencies, CreateTextDocumentParams, DetermineFinalDocumentSettingsResult, Document, DocumentValidator, DocumentValidatorOptions, ENV_CSPELL_GLOB_ROOT, ExcludeFilesGlobMap, ExclusionFunction, exclusionHelper_d as ExclusionHelper, FeatureFlag, FeatureFlags, ImportError, ImportFileRefWithError, IncludeExcludeFlag, IncludeExcludeOptions, index_link_d as Link, Logger, SpellCheckFileOptions, SpellCheckFileResult, SpellingDictionaryLoadError, SuggestedWord, SuggestionError, SuggestionOptions, SuggestionsForWordResult, text_d as Text, TextDocument, TextDocumentLine, TextInfoItem, TraceOptions, TraceResult, UnknownFeatureFlagError, ValidationIssue, calcOverrideSettings, checkFilenameMatchesGlob, checkText, checkTextDocument, clearCachedFiles, clearCachedSettingsFiles, combineTextAndLanguageSettings, combineTextAndLanguageSettings as constructSettingsForText, createSpellingDictionary, createCollection as createSpellingDictionaryCollection, createTextDocument, currentSettingsFileVersion, defaultConfigFilenames, defaultFileName, defaultFileName as defaultSettingsFilename, determineFinalDocumentSettings, extractDependencies, extractImportErrors, fileToDocument, fileToTextDocument, finalizeSettings, getCachedFileSize, getDefaultBundledSettings, getDefaultSettings, getDictionary, getGlobalSettings, getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt, getLogger, getSources, getSystemFeatureFlags, isBinaryFile, isSpellingDictionaryLoadError, loadConfig, loadPnP, loadPnPSync, mergeInDocSettings, mergeSettings, readRawSettings, readSettings, readSettingsFiles, refreshDictionaryCache, resolveFile, searchForConfig, sectionCSpell, setLogger, spellCheckDocument, spellCheckFile, suggestionsForWord, suggestionsForWords, traceWords, traceWordsAsync, updateTextDocument, validateText };
