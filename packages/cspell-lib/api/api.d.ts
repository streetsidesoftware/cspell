/// <reference types="node" />
import { Glob, CSpellSettingsWithSourceTrace, TextOffset, TextDocumentOffset, AdvancedCSpellSettingsWithSourceTrace, Parser, DictionaryDefinitionInline, DictionaryDefinitionPreferred, DictionaryDefinitionAugmented, DictionaryDefinitionCustom, ImportFileRef, PnPSettings, CSpellUserSettings, Issue, LocaleId, CSpellSettings, MappedText, ParsedText } from '@cspell/cspell-types';
export * from '@cspell/cspell-types';
import { WeightMap } from 'cspell-trie-lib';
export { CompoundWordsMethod } from 'cspell-trie-lib';
import { CSpellConfigFile } from 'cspell-config-lib';
import { CSpellIO } from 'cspell-io';
export { asyncIterableToArray, readFileText as readFile, readFileTextSync as readFileSync, writeToFile, writeToFileIterable, writeToFileIterableP } from 'cspell-io';
import { SuggestOptions, SuggestionResult, CachingDictionary, SpellingDictionaryCollection } from 'cspell-dictionary';
export { SpellingDictionary, SpellingDictionaryCollection, SuggestOptions, SuggestionCollector, SuggestionResult, createSpellingDictionary, createCollection as createSpellingDictionaryCollection } from 'cspell-dictionary';

type ExclusionFunction = (fileUri: string) => boolean;
type FileExclusionFunction = (file: string) => boolean;
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

type exclusionHelper_d_ExcludeFilesGlobMap = ExcludeFilesGlobMap;
type exclusionHelper_d_ExclusionFunction = ExclusionFunction;
type exclusionHelper_d_FileExclusionFunction = FileExclusionFunction;
declare const exclusionHelper_d_extractGlobsFromExcludeFilesGlobMap: typeof extractGlobsFromExcludeFilesGlobMap;
declare const exclusionHelper_d_generateExclusionFunctionForFiles: typeof generateExclusionFunctionForFiles;
declare const exclusionHelper_d_generateExclusionFunctionForUri: typeof generateExclusionFunctionForUri;
declare namespace exclusionHelper_d {
  export { type exclusionHelper_d_ExcludeFilesGlobMap as ExcludeFilesGlobMap, type exclusionHelper_d_ExclusionFunction as ExclusionFunction, type exclusionHelper_d_FileExclusionFunction as FileExclusionFunction, exclusionHelper_d_extractGlobsFromExcludeFilesGlobMap as extractGlobsFromExcludeFilesGlobMap, exclusionHelper_d_generateExclusionFunctionForFiles as generateExclusionFunctionForFiles, exclusionHelper_d_generateExclusionFunctionForUri as generateExclusionFunctionForUri };
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
declare function listGlobalImports(): Promise<ListGlobalImportsResults>;
interface AddPathsToGlobalImportsResults {
    success: boolean;
    resolvedSettings: ResolveSettingsResult[];
    error: string | undefined;
}
declare function addPathsToGlobalImports(paths: string[]): Promise<AddPathsToGlobalImportsResults>;
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
declare function removePathsFromGlobalImports(paths: string[]): Promise<RemovePathsFromGlobalImportsResult>;
interface ResolveSettingsResult {
    filename: string;
    resolvedToFilename: string | undefined;
    error?: string;
    settings: CSpellSettingsWithSourceTrace;
}

//# sourceMappingURL=index.link.d.ts.map

type index_link_d_AddPathsToGlobalImportsResults = AddPathsToGlobalImportsResults;
type index_link_d_ListGlobalImportsResult = ListGlobalImportsResult;
type index_link_d_ListGlobalImportsResults = ListGlobalImportsResults;
type index_link_d_RemovePathsFromGlobalImportsResult = RemovePathsFromGlobalImportsResult;
type index_link_d_ResolveSettingsResult = ResolveSettingsResult;
declare const index_link_d_addPathsToGlobalImports: typeof addPathsToGlobalImports;
declare const index_link_d_listGlobalImports: typeof listGlobalImports;
declare const index_link_d_removePathsFromGlobalImports: typeof removePathsFromGlobalImports;
declare namespace index_link_d {
  export { type index_link_d_AddPathsToGlobalImportsResults as AddPathsToGlobalImportsResults, type index_link_d_ListGlobalImportsResult as ListGlobalImportsResult, type index_link_d_ListGlobalImportsResults as ListGlobalImportsResults, type index_link_d_RemovePathsFromGlobalImportsResult as RemovePathsFromGlobalImportsResult, type index_link_d_ResolveSettingsResult as ResolveSettingsResult, index_link_d_addPathsToGlobalImports as addPathsToGlobalImports, index_link_d_listGlobalImports as listGlobalImports, index_link_d_removePathsFromGlobalImports as removePathsFromGlobalImports };
}

interface Uri {
    readonly scheme: string;
    readonly path: string;
    readonly authority?: string;
    readonly fragment?: string;
    readonly query?: string;
}

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
declare function calculateTextDocumentOffsets<T extends TextOffset>(uri: string | Uri | URL, doc: string, wordOffsets: T[]): (TextDocumentOffset & T)[];
declare function removeAccents(text: string): string;
declare const __testing__: {
    regExWords: RegExp;
    regExWordsAndDigits: RegExp;
};

declare const text_d___testing__: typeof __testing__;
declare const text_d_calculateTextDocumentOffsets: typeof calculateTextDocumentOffsets;
declare const text_d_camelToSnake: typeof camelToSnake;
declare const text_d_cleanText: typeof cleanText;
declare const text_d_cleanTextOffset: typeof cleanTextOffset;
declare const text_d_extractLinesOfText: typeof extractLinesOfText;
declare const text_d_extractPossibleWordsFromTextOffset: typeof extractPossibleWordsFromTextOffset;
declare const text_d_extractText: typeof extractText;
declare const text_d_extractWordsFromCode: typeof extractWordsFromCode;
declare const text_d_extractWordsFromCodeTextOffset: typeof extractWordsFromCodeTextOffset;
declare const text_d_extractWordsFromText: typeof extractWordsFromText;
declare const text_d_extractWordsFromTextOffset: typeof extractWordsFromTextOffset;
declare const text_d_isFirstCharacterLower: typeof isFirstCharacterLower;
declare const text_d_isFirstCharacterUpper: typeof isFirstCharacterUpper;
declare const text_d_isLowerCase: typeof isLowerCase;
declare const text_d_isUpperCase: typeof isUpperCase;
declare const text_d_lcFirst: typeof lcFirst;
declare const text_d_match: typeof match;
declare const text_d_matchCase: typeof matchCase;
declare const text_d_matchStringToTextOffset: typeof matchStringToTextOffset;
declare const text_d_matchToTextOffset: typeof matchToTextOffset;
declare const text_d_removeAccents: typeof removeAccents;
declare const text_d_snakeToCamel: typeof snakeToCamel;
declare const text_d_splitCamelCaseWord: typeof splitCamelCaseWord;
declare const text_d_splitCamelCaseWordWithOffset: typeof splitCamelCaseWordWithOffset;
declare const text_d_stringToRegExp: typeof stringToRegExp;
declare const text_d_textOffset: typeof textOffset;
declare const text_d_ucFirst: typeof ucFirst;
declare namespace text_d {
  export { text_d___testing__ as __testing__, text_d_calculateTextDocumentOffsets as calculateTextDocumentOffsets, text_d_camelToSnake as camelToSnake, text_d_cleanText as cleanText, text_d_cleanTextOffset as cleanTextOffset, text_d_extractLinesOfText as extractLinesOfText, text_d_extractPossibleWordsFromTextOffset as extractPossibleWordsFromTextOffset, text_d_extractText as extractText, text_d_extractWordsFromCode as extractWordsFromCode, text_d_extractWordsFromCodeTextOffset as extractWordsFromCodeTextOffset, text_d_extractWordsFromText as extractWordsFromText, text_d_extractWordsFromTextOffset as extractWordsFromTextOffset, text_d_isFirstCharacterLower as isFirstCharacterLower, text_d_isFirstCharacterUpper as isFirstCharacterUpper, text_d_isLowerCase as isLowerCase, text_d_isUpperCase as isUpperCase, text_d_lcFirst as lcFirst, text_d_match as match, text_d_matchCase as matchCase, text_d_matchStringToTextOffset as matchStringToTextOffset, text_d_matchToTextOffset as matchToTextOffset, text_d_removeAccents as removeAccents, text_d_snakeToCamel as snakeToCamel, text_d_splitCamelCaseWord as splitCamelCaseWord, text_d_splitCamelCaseWordWithOffset as splitCamelCaseWordWithOffset, text_d_stringToRegExp as stringToRegExp, text_d_textOffset as textOffset, text_d_ucFirst as ucFirst };
}

interface Document {
    uri: UriString;
    text?: string;
    languageId?: string;
    locale?: string;
}
type UriString = string;
interface DocumentWithText extends Document {
    text: string;
}

declare function isBinaryFile(filename: Uri | URL | string, languageId?: string | string[]): boolean;

type DocumentUri = Uri;
interface Position {
    line: number;
    character: number;
}
/**
 * Range offset tuple.
 */
type SimpleRange$1 = [start: number, end: number];
interface TextDocumentLine {
    readonly text: string;
    readonly offset: number;
    readonly position: Position;
}
interface TextDocumentRef {
    /**
     * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
     * represent files on disk. However, some documents may have other schemes indicating that they are not
     * available on disk.
     */
    readonly uri: DocumentUri;
    /**
     * The identifier of the language associated with this document.
     */
    readonly languageId?: string | string[] | undefined;
    /**
     * the raw Document Text
     */
    readonly text?: string | undefined;
    /**
     * The natural language locale.
     */
    readonly locale?: string | undefined;
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

declare function fileToDocument(file: string): Document;
declare function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
declare function fileToDocument(file: string, text?: string, languageId?: string, locale?: string): Document | DocumentWithText;
declare function fileToTextDocument(file: string): Promise<TextDocument>;

interface FeatureFlag {
    name: string;
    description: string;
}
type FlagTypes = string | boolean;
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

type LanguageId = string;
declare function getLanguagesForExt(ext: string): string[];
declare function getLanguagesForBasename(basename: string): string[];

/**
 * The keys of an object where the values cannot be undefined.
 */
type OptionalKeys<T> = Exclude<{
    [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? never : P;
}[keyof T], undefined>;
/**
 * Allow undefined in optional fields
 */
type OptionalOrUndefined<T> = {
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
type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;
type DictionaryDefinitionInternal = DictionaryFileDefinitionInternal | DictionaryDefinitionInlineInternal;
type DictionaryDefinitionInlineInternal = DictionaryDefinitionInline & {
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
};
interface DictionaryFileDefinitionInternal extends Readonly<DictionaryDefinitionPreferred>, Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>, Readonly<DictionaryDefinitionAugmented> {
    /**
     * Optional weight map used to improve suggestions.
     */
    readonly weightMap?: WeightMap | undefined;
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
}

type CSpellSettingsWST$1 = AdvancedCSpellSettingsWithSourceTrace;
type CSpellSettingsWSTO = OptionalOrUndefined<AdvancedCSpellSettingsWithSourceTrace>;
type CSpellSettingsI$1 = CSpellSettingsInternal;

declare function mergeSettings(left: CSpellSettingsWSTO | CSpellSettingsI$1, ...settings: (CSpellSettingsWSTO | CSpellSettingsI$1 | undefined)[]): CSpellSettingsI$1;
declare function mergeInDocSettings(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): CSpellSettingsWST$1;
/**
 *
 * @param settings - settings to finalize
 * @returns settings where all globs and file paths have been resolved.
 */
declare function finalizeSettings(settings: CSpellSettingsWSTO | CSpellSettingsI$1): CSpellSettingsInternalFinalized;
/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings the settings to search
 */
declare function getSources(settings: CSpellSettingsWSTO): CSpellSettingsWSTO[];
interface ImportFileRefWithError$1 extends ImportFileRef {
    error: Error;
}
interface ConfigurationDependencies {
    configFiles: string[];
    dictionaryFiles: string[];
}
declare function extractDependencies(settings: CSpellSettingsWSTO | CSpellSettingsI$1): ConfigurationDependencies;

declare function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI$1;

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 */
declare function checkFilenameMatchesExcludeGlob(filename: string, globs: Glob | Glob[]): boolean;

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 * @deprecated true
 * @deprecationMessage No longer actively supported. Use package: `cspell-glob`.
 */
declare const checkFilenameMatchesGlob: typeof checkFilenameMatchesExcludeGlob;

declare const currentSettingsFileVersion = "0.2";
declare const ENV_CSPELL_GLOB_ROOT = "CSPELL_GLOB_ROOT";

type LoaderResult = URL | undefined;

type PnPSettingsOptional = OptionalOrUndefined<PnPSettings>;

type CSpellSettingsWST = CSpellSettingsWithSourceTrace;
type CSpellSettingsI = CSpellSettingsInternal;

declare const sectionCSpell = "cSpell";
declare const defaultFileName = "cspell.json";
interface IConfigLoader {
    readSettingsAsync(filename: string | URL, relativeTo?: string | URL, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI>;
    /**
     * Read a cspell configuration file.
     * @param filenameOrURL - URL, relative path, absolute path, or package name.
     * @param relativeTo - optional URL, defaults to `pathToFileURL('./')`
     */
    readConfigFile(filenameOrURL: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile | Error>;
    searchForConfigFileLocation(searchFrom: URL | string | undefined): Promise<URL | undefined>;
    searchForConfigFile(searchFrom: URL | string | undefined): Promise<CSpellConfigFile | undefined>;
    /**
     * This is an alias for `searchForConfigFile` and `mergeConfigFileWithImports`.
     * @param searchFrom the directory / file URL to start searching from.
     * @param pnpSettings - related to Using Yarn PNP.
     * @returns the resulting settings
     */
    searchForConfig(searchFrom: URL | string | undefined, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI | undefined>;
    getGlobalSettingsAsync(): Promise<CSpellSettingsI>;
    /**
     * The loader caches configuration files for performance. This method clears the cache.
     */
    clearCachedSettingsFiles(): void;
    /**
     * Resolve imports and merge.
     * @param cfgFile - configuration file.
     * @param pnpSettings - optional settings related to Using Yarn PNP.
     */
    mergeConfigFileWithImports(cfgFile: CSpellConfigFile, pnpSettings?: PnPSettingsOptional | undefined): Promise<CSpellSettingsI>;
    /**
     * Create an in memory CSpellConfigFile.
     * @param filename - URL to the file. Used to resolve imports.
     * @param settings - settings to use.
     */
    createCSpellConfigFile(filename: URL | string, settings: CSpellUserSettings): CSpellConfigFile;
    /**
     * Unsubscribe from any events and dispose of any resources including caches.
     */
    dispose(): void;
    getStats(): Readonly<Record<string, Readonly<Record<string, number>>>>;
}
declare function loadPnP(pnpSettings: PnPSettingsOptional, searchFrom: URL): Promise<LoaderResult>;
declare function createConfigLoader(cspellIO?: CSpellIO): IConfigLoader;

declare const defaultConfigFilenames: readonly string[];

/**
 *
 * @param searchFrom the directory / file to start searching from.
 * @param pnpSettings - related to Using Yarn PNP.
 * @returns the resulting settings
 */
declare function searchForConfig(searchFrom: URL | string | undefined, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI | undefined>;
/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
declare function loadConfig(file: string, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI>;
/**
 * Might throw if the settings have not yet been loaded.
 * @deprecated use {@link getGlobalSettingsAsync} instead.
 */
declare function getGlobalSettings(): CSpellSettingsI;
/**
 * Loads and caches the global settings.
 * @returns - global settings
 */
declare function getGlobalSettingsAsync(): Promise<CSpellSettingsI>;
declare function getCachedFileSize(): number;
declare function getDefaultConfigLoader(): IConfigLoader;
declare function readRawSettings(filename: string | URL, relativeTo?: string | URL): Promise<CSpellSettingsWST>;

declare function extractImportErrors(settings: CSpellSettingsWST): ImportFileRefWithError[];
interface ImportFileRefWithError extends ImportFileRef {
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
declare function readSettings(filename: string | URL): Promise<CSpellSettingsI>;
declare function readSettings(filename: string | URL, pnpSettings: PnPSettingsOptional): Promise<CSpellSettingsI>;
/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to `relativeTo`)
 *   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
 * @param relativeTo - absolute path to start searching for relative files or node_modules.
 */
declare function readSettings(filename: string | URL, relativeTo: string | URL): Promise<CSpellSettingsI>;
declare function readSettings(filename: string | URL, relativeTo: string | URL, pnpSettings: PnPSettingsOptional): Promise<CSpellSettingsI>;

/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */
declare function readSettingsFiles(filenames: string[]): Promise<CSpellSettingsI>;

declare class ImportError extends Error {
    readonly cause: Error | undefined;
    constructor(msg: string, cause?: Error | unknown);
}

declare function getDefaultSettings(useDefaultDictionaries?: boolean): Promise<CSpellSettingsInternal>;
declare function getDefaultBundledSettingsAsync(): Promise<CSpellSettingsInternal>;

declare function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string | undefined, languageId: string | string[]): CSpellSettingsInternal;

interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}

interface ValidationResult extends TextOffset, Pick<Issue, 'message' | 'issueType'> {
    line: TextOffset;
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
}

interface ValidationIssue extends ValidationResult {
    suggestions?: string[] | undefined;
    suggestionsEx?: ExtendedSuggestion[] | undefined;
}

declare function refreshDictionaryCache(maxAge?: number): Promise<void>;

type LoadOptions = DictionaryDefinitionInternal;

declare class SpellingDictionaryLoadError extends Error {
    readonly uri: string;
    readonly options: LoadOptions;
    readonly cause: Error;
    readonly name: string;
    constructor(uri: string, options: LoadOptions, cause: Error, message: string);
}
declare function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError;

interface WordSuggestion extends SuggestionResult {
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}
interface SuggestedWordBase extends WordSuggestion {
    /**
     * dictionary names
     */
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
type FromSuggestOptions = Pick<SuggestOptions, 'numChanges' | 'numSuggestions' | 'includeTies'>;
interface SuggestionOptions extends FromSuggestOptions {
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
    numSuggestions?: number | undefined;
    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     * @default 4
     */
    numChanges?: number | undefined;
    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default true
     */
    includeTies?: boolean | undefined;
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

interface MatchRange {
    startPos: number;
    endPos: number;
}

type TextOffsetRO = Readonly<TextOffset>;
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
type LineValidatorFn = (line: LineSegment) => Iterable<ValidationIssue>;
interface LineSegment {
    line: TextOffsetRO;
    segment: TextOffsetRO;
}
interface MappedTextValidationResult extends MappedText {
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
    suggestionsEx?: ExtendedSuggestion[] | undefined;
}
type TextValidatorFn = (text: MappedText) => Iterable<MappedTextValidationResult>;

interface LineValidator {
    fn: LineValidatorFn;
    dict: CachingDictionary;
}
interface TextValidator {
    validate: TextValidatorFn;
    lineValidator: LineValidator;
}

type Offset = number;
type SimpleRange = readonly [Offset, Offset];

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
    /**
     * Skips spell checking the document. Useful for testing and dry runs.
     * It will read the configuration and parse the document.
     */
    skipValidation?: boolean;
}

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
type PerfTimings = Record<string, number>;
declare class DocumentValidator {
    readonly settings: CSpellUserSettings;
    private _document;
    private _ready;
    readonly errors: Error[];
    private _prepared;
    private _preparations;
    private _preparationTime;
    private _suggestions;
    readonly options: DocumentValidatorOptions;
    readonly perfTiming: PerfTimings;
    skipValidation: boolean;
    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, options: DocumentValidatorOptions, settings: CSpellUserSettings);
    get ready(): boolean;
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
    updateDocumentText(text: string): Promise<void>;
    private defaultParser;
    private _checkParsedText;
    private addPossibleError;
    private _parse;
    private getSuggestions;
    private genSuggestions;
    private adjustSuggestions;
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
interface ShouldCheckDocumentResult {
    errors: Error[];
    shouldCheck: boolean;
}
declare function shouldCheckDocument(doc: TextDocumentRef, options: DocumentValidatorOptions, settings: CSpellUserSettings): Promise<ShouldCheckDocumentResult>;

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

/**
 * @deprecated
 * @deprecationMessage Use spellCheckDocument
 */
declare function validateText(text: string, settings: CSpellUserSettings, options?: ValidateTextOptions): Promise<ValidationIssue[]>;

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
interface SpellCheckFilePerf extends Record<string, number | undefined> {
    loadTimeMs?: number;
    prepareTimeMs?: number;
    checkTimeMs?: number;
    totalTimeMs?: number;
}
interface SpellCheckFileResult {
    document: Document | DocumentWithText;
    settingsUsed: CSpellSettingsWithSourceTrace;
    localConfigFilepath: string | undefined;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
    errors: Error[] | undefined;
    perf?: SpellCheckFilePerf;
}
/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
declare function spellCheckFile(file: string | Uri | URL, options: SpellCheckFileOptions, settings: CSpellUserSettings): Promise<SpellCheckFileResult>;
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
declare function determineFinalDocumentSettings(document: DocumentWithText, settings: CSpellUserSettings): Promise<DetermineFinalDocumentSettingsResult>;

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

type Console = typeof console;
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
    /**
     * Absolute path or URL to the file.
     */
    filename: string;
    relativeTo: string | undefined;
    found: boolean;
    /**
     * A warning message if the file was found, but there was a problem.
     */
    warning?: string;
    /**
     * The method used to resolve the file.
     */
    method: string;
}
/**
 * Resolve filename to absolute paths.
 * It tries to look for local files as well as node_modules
 * @param filename an absolute path, relative path, `~` path, or a node_module.
 * @param relativeTo absolute path
 */
declare function resolveFile(filename: string, relativeTo: string | URL): ResolveFileResult;

/**
 * Clear the cached files and other cached data.
 * Calling this function will cause the next spell check to take longer because it will need to reload configuration files and dictionaries.
 * Call this function if configuration files have changed.
 *
 * It is safe to replace {@link clearCachedFiles} with {@link clearCaches}
 */
declare function clearCachedFiles(): Promise<void>;
/**
 * Sends and event to clear the caches.
 * It resets the configuration files and dictionaries.
 *
 * It is safe to replace {@link clearCaches} with {@link clearCachedFiles}
 */
declare function clearCaches(): void;

/**
 * Load a dictionary collection defined by the settings.
 * @param settings - that defines the dictionaries and the ones to load.
 * @returns a dictionary collection that represents all the enabled dictionaries.
 */
declare function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection>;

interface PerfTimer {
    readonly name: string;
    readonly startTime: number;
    readonly elapsed: number;
    start(): void;
    end(): void;
}
type TimeNowFn = () => number;
declare function createPerfTimer(name: string, onEnd?: (elapsed: number, name: string) => void, timeNowFn?: TimeNowFn): PerfTimer;

export { type CheckTextInfo, type ConfigurationDependencies, type CreateTextDocumentParams, type DetermineFinalDocumentSettingsResult, type Document, DocumentValidator, type DocumentValidatorOptions, ENV_CSPELL_GLOB_ROOT, type ExcludeFilesGlobMap, type ExclusionFunction, exclusionHelper_d as ExclusionHelper, type FeatureFlag, FeatureFlags, ImportError, type ImportFileRefWithError$1 as ImportFileRefWithError, IncludeExcludeFlag, type IncludeExcludeOptions, index_link_d as Link, type Logger, type PerfTimer, type SpellCheckFileOptions, type SpellCheckFileResult, SpellingDictionaryLoadError, type SuggestedWord, SuggestionError, type SuggestionOptions, type SuggestionsForWordResult, text_d as Text, type TextDocument, type TextDocumentLine, type TextDocumentRef, type TextInfoItem, type TraceOptions, type TraceResult, UnknownFeatureFlagError, type ValidationIssue, calcOverrideSettings, checkFilenameMatchesGlob, checkText, checkTextDocument, clearCachedFiles, clearCaches, combineTextAndLanguageSettings, combineTextAndLanguageSettings as constructSettingsForText, createConfigLoader, createPerfTimer, createTextDocument, currentSettingsFileVersion, defaultConfigFilenames, defaultFileName, defaultFileName as defaultSettingsFilename, determineFinalDocumentSettings, extractDependencies, extractImportErrors, fileToDocument, fileToTextDocument, finalizeSettings, getCachedFileSize, getDefaultBundledSettingsAsync, getDefaultConfigLoader, getDefaultSettings, getDictionary, getGlobalSettings, getGlobalSettingsAsync, getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt, getLogger, getSources, getSystemFeatureFlags, isBinaryFile, isSpellingDictionaryLoadError, loadConfig, loadPnP, mergeInDocSettings, mergeSettings, readRawSettings, readSettings, readSettingsFiles, refreshDictionaryCache, resolveFile, searchForConfig, sectionCSpell, setLogger, shouldCheckDocument, spellCheckDocument, spellCheckFile, suggestionsForWord, suggestionsForWords, traceWords, traceWordsAsync, updateTextDocument, validateText };
