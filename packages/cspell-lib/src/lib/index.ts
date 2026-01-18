export { clearCachedFiles, clearCaches } from './clearCachedFiles.js';
export type { Document } from './Document/index.js';
export { fileToDocument, fileToTextDocument, isBinaryFile } from './Document/index.js';
export type { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper.js';
export * as ExclusionHelper from './exclusionHelper.js';
export {
    type FeatureFlag,
    FeatureFlags,
    getSystemFeatureFlags,
    UnknownFeatureFlagError,
} from './FeatureFlags/index.js';
export type { VFileSystemProvider, VirtualFS } from './fileSystem.js';
export { FSCapabilityFlags, getVirtualFS } from './fileSystem.js';
export { getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt } from './fileTypes.js';
export { getDictionary } from './getDictionary.js';
export type {
    CreateTextDocumentParams,
    TextDocument,
    TextDocumentLine,
    TextDocumentRef,
} from './Models/TextDocument.js';
export { createTextDocument, updateTextDocument } from './Models/TextDocument.js';
export type { PerfTimer } from './perf/index.js';
export { createPerfTimer } from './perf/index.js';
export type {
    ConfigurationDependencies,
    CSpellConfigFile,
    ICSpellConfigFile,
    ImportFileRefWithError,
} from './Settings/index.js';
export {
    calcOverrideSettings,
    checkFilenameMatchesGlob,
    createConfigLoader,
    currentSettingsFileVersion,
    defaultConfigFilenames,
    defaultFileName,
    ENV_CSPELL_GLOB_ROOT,
    extractDependencies,
    extractImportErrors,
    finalizeSettings,
    getCachedFileSize,
    getDefaultBundledSettingsAsync,
    getDefaultConfigLoader,
    getDefaultSettings,
    getGlobalSettings,
    getGlobalSettingsAsync,
    getSources,
    ImportError,
    loadConfig,
    loadPnP,
    mergeInDocSettings,
    mergeSettings,
    readConfigFile,
    readRawSettings,
    readSettings,
    readSettingsFiles,
    resolveConfigFileImports,
    searchForConfig,
    sectionCSpell,
    toCSpellSettingsWithOutSourceTrace,
} from './Settings/index.js';
export { defaultFileName as defaultSettingsFilename } from './Settings/index.js';
export * as Link from './Settings/index.link.js';
export {
    combineTextAndLanguageSettings,
    combineTextAndLanguageSettings as constructSettingsForText,
} from './Settings/TextDocumentSettings.js';
export {
    determineFinalDocumentSettings,
    type DetermineFinalDocumentSettingsResult,
    spellCheckDocument,
    spellCheckDocumentRPC,
    spellCheckFile,
    type SpellCheckFileOptions,
    type SpellCheckFilePerf,
    type SpellCheckFileResult,
} from './spellCheckFile.js';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    createCollection as createSpellingDictionaryCollection,
    isSpellingDictionaryLoadError,
    refreshDictionaryCache,
    type SpellingDictionary,
    type SpellingDictionaryCollection,
    SpellingDictionaryLoadError,
    type SuggestionCollector,
    type SuggestionResult,
    type SuggestOptions,
} from './SpellingDictionary/index.js';
export type { SuggestedWord, SuggestionOptions, SuggestionsForWordResult } from './suggestions.js';
export { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions.js';
export { DocumentValidator, type DocumentValidatorOptions, shouldCheckDocument } from './textValidation/index.js';
export type { TraceOptions, TraceResult, TraceWordResult } from './trace.js';
export { traceWords, traceWordsAsync } from './trace.js';
export { getLogger, type Logger, setLogger } from './util/logger.js';
export { resolveFile } from './util/resolveFile.js';
export * as Text from './util/textApi.js';
export {
    checkText,
    checkTextDocument,
    type CheckTextInfo,
    IncludeExcludeFlag,
    type IncludeExcludeOptions,
    type TextInfoItem,
    validateText,
    type ValidationIssue,
} from './validator.js';
export * from '@cspell/cspell-types';
export {
    asyncIterableToArray,
    readFileText as readFile,
    readFileTextSync as readFileSync,
    writeToFile,
    writeToFileIterable,
    writeToFileIterableP,
} from 'cspell-io';
