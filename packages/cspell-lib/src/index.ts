import * as ExclusionHelper from './exclusionHelper';
import * as Link from './Settings/index.link';
import * as Text from './util/text';

export type { Document } from './Document';
export { fileToDocument, fileToTextDocument, isBinaryFile } from './Document';
export { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper';
export { FeatureFlag, FeatureFlags, getSystemFeatureFlags, UnknownFeatureFlagError } from './FeatureFlags';
export { getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt } from './LanguageIds';
export type { CreateTextDocumentParams, TextDocument, TextDocumentLine } from './Models/TextDocument';
export { createTextDocument, updateTextDocument } from './Models/TextDocument';
export {
    calcOverrideSettings,
    checkFilenameMatchesGlob,
    clearCachedSettingsFiles,
    type ConfigurationDependencies,
    currentSettingsFileVersion,
    defaultConfigFilenames,
    defaultFileName,
    ENV_CSPELL_GLOB_ROOT,
    extractDependencies,
    extractImportErrors,
    finalizeSettings,
    getCachedFileSize,
    getDefaultBundledSettings,
    getDefaultSettings,
    getGlobalSettings,
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
} from './Settings';
export { defaultFileName as defaultSettingsFilename } from './Settings';
export {
    combineTextAndLanguageSettings,
    combineTextAndLanguageSettings as constructSettingsForText,
} from './Settings/TextDocumentSettings';
export {
    determineFinalDocumentSettings,
    DetermineFinalDocumentSettingsResult,
    spellCheckDocument,
    spellCheckFile,
    SpellCheckFileOptions,
    SpellCheckFileResult,
} from './spellCheckFile';
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
} from './SpellingDictionary';
export type { SuggestedWord, SuggestionOptions, SuggestionsForWordResult } from './suggestions';
export { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions';
export { DocumentValidator, DocumentValidatorOptions } from './textValidation';
export type { TraceOptions, TraceResult } from './trace';
export { traceWords, traceWordsAsync } from './trace';
export { getLogger, Logger, setLogger } from './util/logger';
export { resolveFile } from './util/resolveFile';
export {
    checkText,
    checkTextDocument,
    CheckTextInfo,
    IncludeExcludeFlag,
    IncludeExcludeOptions,
    TextInfoItem,
    validateText,
    ValidationIssue,
} from './validator';
export * from '@cspell/cspell-types';
export {
    asyncIterableToArray,
    readFile,
    readFileSync,
    writeToFile,
    writeToFileIterable,
    writeToFileIterableP,
} from 'cspell-io';
export { Link, Text };
export { ExclusionHelper };
export { clearCachedFiles } from './clearCachedFiles';
export { getDictionary } from './getDictionary';
