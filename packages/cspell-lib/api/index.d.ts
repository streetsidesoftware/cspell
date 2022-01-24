/// <reference types="node" />
import { Glob, CSpellSettingsWithSourceTrace, DictionaryDefinitionPreferred, DictionaryDefinitionAugmented, DictionaryDefinitionCustom, PnPSettings, ImportFileRef, ReplaceMap, SuggestionCostsDefs, TextOffset, TextDocumentOffset, CSpellUserSettings, LocaleId, CSpellSettings } from '@cspell/cspell-types';
export * from '@cspell/cspell-types';
import { URI } from 'vscode-uri';
import { CompoundWordsMethod, SuggestionResult, SuggestionCollector } from 'cspell-trie-lib';
export { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import { Sequence } from 'gensequence';
export * from 'cspell-io';

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

declare const SymbolCSpellSettingsInternal: unique symbol;
interface CSpellSettingsInternal extends Omit<CSpellSettingsWithSourceTrace, 'dictionaryDefinitions'> {
    [SymbolCSpellSettingsInternal]: true;
    dictionaryDefinitions?: DictionaryDefinitionInternal[];
}
declare type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;
interface DictionaryDefinitionInternal extends DictionaryDefinitionPreferred, Partial<DictionaryDefinitionCustomUniqueFields>, DictionaryDefinitionAugmented {
}

/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */

declare type LoaderResult = URI | undefined;

declare const currentSettingsFileVersion = "0.2";
declare const sectionCSpell = "cSpell";
declare const defaultFileName = "cspell.json";
declare const ENV_CSPELL_GLOB_ROOT = "CSPELL_GLOB_ROOT";
declare const defaultConfigFilenames: readonly string[];
declare type CSpellSettingsX = CSpellSettingsWithSourceTrace;
declare type CSpellSettingsWST = CSpellSettingsWithSourceTrace;
declare type CSpellSettingsI = CSpellSettingsInternal;
declare function readSettings(filename: string): CSpellSettingsI;
declare function readSettings(filename: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
declare function readSettings(filename: string, relativeTo: string): CSpellSettingsI;
declare function readSettings(filename: string, relativeTo: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
declare function searchForConfig(searchFrom: string | undefined, pnpSettings?: PnPSettings): Promise<CSpellSettingsX | undefined>;
/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
declare function loadConfig(file: string, pnpSettings?: PnPSettings): Promise<CSpellSettingsI>;
declare function loadPnP(pnpSettings: PnPSettings, searchFrom: URI): Promise<LoaderResult>;
declare function loadPnPSync(pnpSettings: PnPSettings, searchFrom: URI): LoaderResult;
declare function readRawSettings(filename: string, relativeTo?: string): CSpellSettingsX;
/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */
declare function readSettingsFiles(filenames: string[]): CSpellSettingsX;
declare function mergeSettings(left: CSpellSettingsI, ...settings: CSpellSettingsI[]): CSpellSettingsI;
declare function mergeSettings(left: CSpellSettingsWST, ...settings: CSpellSettingsWST[]): CSpellSettingsWST;
declare function mergeInDocSettings(left: CSpellSettingsX, right: CSpellSettingsX): CSpellSettingsX;
declare function calcOverrideSettings(settings: CSpellSettingsX, filename: string): CSpellSettingsX;
declare function finalizeSettings(settings: CSpellSettingsWST | CSpellSettingsI): CSpellSettingsI;
declare function getGlobalSettings(): CSpellSettingsX;
declare function getCachedFileSize(): number;
declare function clearCachedSettingsFiles(): void;
declare function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean;
/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings the settings to search
 */
declare function getSources(settings: CSpellSettingsX): CSpellSettingsX[];
interface ImportFileRefWithError extends ImportFileRef {
    error: Error;
}
declare function extractImportErrors(settings: CSpellSettingsX): ImportFileRefWithError[];
interface ConfigurationDependencies {
    configFiles: string[];
    dictionaryFiles: string[];
}
declare function extractDependencies(settings: CSpellSettingsWST | CSpellSettingsI): ConfigurationDependencies;

declare function getDefaultSettings(): CSpellSettingsInternal;

declare class ImportError extends Error {
    readonly cause?: Error;
    constructor(msg: string, cause?: Error | unknown);
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

interface SearchOptions {
    useCompounds?: boolean | number;
    ignoreCase?: boolean;
}
interface SuggestOptions {
    /**
     * Compounding Mode.
     * `NONE` is the best option.
     */
    compoundMethod?: CompoundWordsMethod;
    /**
     * The limit on the number of suggestions to generate. If `allowTies` is true, it is possible
     * for more suggestions to be generated.
     */
    numSuggestions?: number;
    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     */
    numChanges?: number;
    /**
     * Allow for case-ingestive checking.
     */
    ignoreCase?: boolean;
    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default false
     */
    includeTies?: boolean;
    /**
     * Maximum amount of time to allow for generating suggestions.
     */
    timeout?: number;
}
interface FindResult {
    /** the text found, otherwise `false` */
    found: string | false;
    /** `true` if it is considered a forbidden word. */
    forbidden: boolean;
    /** `true` if it is a no-suggest word. */
    noSuggest: boolean;
}
declare type HasOptions = SearchOptions;
interface SpellingDictionaryOptions {
    repMap?: ReplaceMap;
    useCompounds?: boolean;
    caseSensitive?: boolean;
    noSuggest?: boolean;
    suggestionDefs?: SuggestionCostsDefs | undefined;
}
interface SpellingDictionary {
    readonly name: string;
    readonly type: string;
    readonly source: string;
    readonly containsNoSuggestWords: boolean;
    has(word: string, options?: HasOptions): boolean;
    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, options?: SearchOptions): FindResult | undefined;
    isForbidden(word: string): boolean;
    isNoSuggestWord(word: string, options: HasOptions): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number, ignoreCase?: boolean): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void;
    mapWord(word: string): string;
    readonly size: number;
    readonly options: SpellingDictionaryOptions;
    readonly isDictionaryCaseSensitive: boolean;
    getErrors?(): Error[];
}

declare function identityString(w: string): string;
declare class SpellingDictionaryCollection implements SpellingDictionary {
    readonly dictionaries: SpellingDictionary[];
    readonly name: string;
    readonly options: SpellingDictionaryOptions;
    readonly mapWord: typeof identityString;
    readonly type = "SpellingDictionaryCollection";
    readonly source: string;
    readonly isDictionaryCaseSensitive: boolean;
    readonly containsNoSuggestWords: boolean;
    constructor(dictionaries: SpellingDictionary[], name: string);
    has(word: string, hasOptions?: HasOptions): boolean;
    find(word: string, hasOptions?: HasOptions): FindResult | undefined;
    isNoSuggestWord(word: string, options?: HasOptions): boolean;
    isForbidden(word: string): boolean;
    suggest(word: string, numSuggestions?: number, compoundMethod?: CompoundWordsMethod, numChanges?: number, ignoreCase?: boolean): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    _suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    get size(): number;
    genSuggestions(collector: SuggestionCollector, suggestOptions: SuggestOptions): void;
    getErrors(): Error[];
    private _isForbiddenInDict;
    private _isNoSuggestWord;
}

declare function refreshDictionaryCache(maxAge?: number): Promise<void>;

interface IterableLike<T> {
    [Symbol.iterator]: () => Iterator<T> | IterableIterator<T>;
}

declare type LoadOptions = DictionaryDefinitionPreferred;

declare class SpellingDictionaryLoadError extends Error {
    readonly uri: string;
    readonly options: LoadOptions;
    readonly cause: Error;
    readonly name: string;
    constructor(uri: string, options: LoadOptions, cause: Error, message: string);
}
declare function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError;

declare function createSpellingDictionary(wordList: string[] | IterableLike<string>, name: string, source: string, options: SpellingDictionaryOptions | undefined): SpellingDictionary;

declare function splitCamelCaseWordWithOffset(wo: TextOffset): Array<TextOffset>;
/**
 * Split camelCase words into an array of strings.
 */
declare function splitCamelCaseWord(word: string): string[];
/**
 * This function lets you iterate over regular expression matches.
 */
declare function match(reg: RegExp, text: string): Sequence<RegExpExecArray>;
declare function matchStringToTextOffset(reg: RegExp, text: string): Sequence<TextOffset>;
declare function matchToTextOffset(reg: RegExp, text: TextOffset): Sequence<TextOffset>;
declare function extractLinesOfText(text: string): Sequence<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
declare function extractWordsFromText(text: string): Sequence<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
declare function extractWordsFromTextOffset(text: TextOffset): Sequence<TextOffset>;
declare function cleanText(text: string): string;
declare function cleanTextOffset(text: TextOffset): TextOffset;
/**
 * Extract out whole words and words containing numbers from a string of text.
 */
declare function extractPossibleWordsFromTextOffset(text: TextOffset): Sequence<TextOffset>;
declare function extractWordsFromCode(text: string): Sequence<TextOffset>;
declare function extractWordsFromCodeTextOffset(textOffset: TextOffset): Sequence<TextOffset>;
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
declare function stringToRegExp(pattern: string | RegExp, defaultFlags?: string, forceFlags?: string): RegExp | undefined;
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
declare const text_d_stringToRegExp: typeof stringToRegExp;
declare const text_d_calculateTextDocumentOffsets: typeof calculateTextDocumentOffsets;
declare const text_d_removeAccents: typeof removeAccents;
declare const text_d___testing__: typeof __testing__;
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
    text_d_stringToRegExp as stringToRegExp,
    text_d_calculateTextDocumentOffsets as calculateTextDocumentOffsets,
    text_d_removeAccents as removeAccents,
    text_d___testing__ as __testing__,
  };
}

declare type LanguageId = string;
declare function getLanguagesForExt(ext: string): string[];

declare function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string, languageId: string | string[]): CSpellUserSettings;

interface IncludeExcludeOptions {
    ignoreRegExpList?: (RegExp | string)[];
    includeRegExpList?: (RegExp | string)[];
}
interface ValidationResult extends TextOffset {
    line: TextOffset;
    isFlagged?: boolean;
    isFound?: boolean;
}

interface ValidationIssue extends ValidationResult {
    suggestions?: string[];
}
interface ValidateTextOptions {
    /** Generate suggestions where there are spelling issues. */
    generateSuggestions?: boolean;
    /** The number of suggestions to generate. The higher the number the longer it takes. */
    numSuggestions?: number;
}
declare function validateText(text: string, settings: CSpellUserSettings, options?: ValidateTextOptions): Promise<ValidationIssue[]>;
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
declare function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo>;

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

export { CheckTextInfo, ConfigurationDependencies, DetermineFinalDocumentSettingsResult, Document, ENV_CSPELL_GLOB_ROOT, ExcludeFilesGlobMap, ExclusionFunction, exclusionHelper_d as ExclusionHelper, ImportError, ImportFileRefWithError, IncludeExcludeFlag, IncludeExcludeOptions, index_link_d as Link, Logger, SpellCheckFileOptions, SpellCheckFileResult, SpellingDictionary, SpellingDictionaryCollection, SpellingDictionaryLoadError, SuggestOptions, SuggestedWord, SuggestionError, SuggestionOptions, SuggestionsForWordResult, text_d as Text, TextInfoItem, TraceOptions, TraceResult, ValidationIssue, calcOverrideSettings, checkFilenameMatchesGlob, checkText, clearCachedFiles, clearCachedSettingsFiles, combineTextAndLanguageSettings, combineTextAndLanguageSettings as constructSettingsForText, createSpellingDictionary, currentSettingsFileVersion, defaultConfigFilenames, defaultFileName, defaultFileName as defaultSettingsFilename, determineFinalDocumentSettings, extractDependencies, extractImportErrors, fileToDocument, finalizeSettings, getCachedFileSize, getDefaultSettings, getDictionary, getGlobalSettings, getLanguagesForExt, getLogger, getSources, isBinaryFile, isSpellingDictionaryLoadError, loadConfig, loadPnP, loadPnPSync, mergeInDocSettings, mergeSettings, readRawSettings, readSettings, readSettingsFiles, refreshDictionaryCache, resolveFile, searchForConfig, sectionCSpell, setLogger, spellCheckDocument, spellCheckFile, suggestionsForWord, suggestionsForWords, traceWords, traceWordsAsync, validateText };
