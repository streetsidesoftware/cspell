import * as ExclusionHelper from './exclusionHelper.js';
import * as Link from './Settings/index.link.js';
import * as Text from './util/text.js';

export type { Document } from './Document/index.js';
export { fileToDocument, fileToTextDocument, isBinaryFile } from './Document/index.js';
export { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper.js';
export { FeatureFlag, FeatureFlags, getSystemFeatureFlags, UnknownFeatureFlagError } from './FeatureFlags/index.js';
export { getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt } from './LanguageIds.js';
export type {
    CreateTextDocumentParams,
    TextDocument,
    TextDocumentLine,
    TextDocumentRef,
} from './Models/TextDocument.js';
export { createTextDocument, updateTextDocument } from './Models/TextDocument.js';
export {
    calcOverrideSettings,
    checkFilenameMatchesGlob,
    type ConfigurationDependencies,
    currentSettingsFileVersion,
    defaultConfigFilenames,
    defaultFileName,
    ENV_CSPELL_GLOB_ROOT,
    extractDependencies,
    extractImportErrors,
    finalizeSettings,
    getCachedFileSize,
    getDefaultBundledSettingsAsync,
    getDefaultSettings,
    getGlobalSettings,
    getGlobalSettingsAsync,
    getSources,
    ImportError,
    type ImportFileRefWithError,
    loadConfig,
    loadPnP,
    loadPnPSync,
    mergeInDocSettings,
    mergeSettings,
    readRawSettings,
    readSettings,
    readSettingsFiles,
    searchForConfig,
    sectionCSpell,
} from './Settings/index.js';
export { defaultFileName as defaultSettingsFilename } from './Settings/index.js';
export {
    combineTextAndLanguageSettings,
    combineTextAndLanguageSettings as constructSettingsForText,
} from './Settings/TextDocumentSettings.js';
export {
    determineFinalDocumentSettings,
    DetermineFinalDocumentSettingsResult,
    spellCheckDocument,
    spellCheckFile,
    SpellCheckFileOptions,
    SpellCheckFileResult,
} from './spellCheckFile.js';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    createCollection as createSpellingDictionaryCollection,
    isSpellingDictionaryLoadError,
    refreshDictionaryCache,
    SpellingDictionary,
    SpellingDictionaryCollection,
    SpellingDictionaryLoadError,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary/index.js';
export type { SuggestedWord, SuggestionOptions, SuggestionsForWordResult } from './suggestions.js';
export { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions.js';
export { DocumentValidator, DocumentValidatorOptions, shouldCheckDocument } from './textValidation/index.js';
export type { TraceOptions, TraceResult } from './trace.js';
export { traceWords, traceWordsAsync } from './trace.js';
export { getLogger, Logger, setLogger } from './util/logger.js';
export { resolveFile } from './util/resolveFile.js';
export {
    checkText,
    checkTextDocument,
    CheckTextInfo,
    IncludeExcludeFlag,
    IncludeExcludeOptions,
    TextInfoItem,
    validateText,
    ValidationIssue,
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
export { Link, Text };
export { ExclusionHelper };
export { clearCachedFiles, clearCaches } from './clearCachedFiles.js';
export { getDictionary } from './getDictionary.js';
export type { PerfTimer } from './perf/index.js';
export { createPerfTimer } from './perf/index.js';
