import type { CSpellUserSettings } from '@cspell/cspell-types';

import * as ExclusionHelper from './exclusionHelper';
import { clearCachedSettingsFiles } from './Settings';
import { toInternalSettings } from './Settings/CSpellSettingsServer';
import * as Link from './Settings/index.link';
import type { SpellingDictionaryCollection } from './SpellingDictionary';
import { getDictionaryInternal, refreshDictionaryCache } from './SpellingDictionary';
import * as Text from './util/text';

export type { Document } from './Document';
export { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper';
export { FeatureFlag, FeatureFlags, getSystemFeatureFlags, UnknownFeatureFlagError } from './FeatureFlags';
export { getLanguagesForBasename as getLanguageIdsForBaseFilename, getLanguagesForExt } from './LanguageIds';
export type { CreateTextDocumentParams, TextDocument, TextDocumentLine } from './Models/TextDocument';
export { createTextDocument, updateTextDocument } from './Models/TextDocument';
export * from './Settings';
export { defaultFileName as defaultSettingsFilename } from './Settings';
export {
    combineTextAndLanguageSettings,
    combineTextAndLanguageSettings as constructSettingsForText,
} from './Settings/TextDocumentSettings';
export {
    determineFinalDocumentSettings,
    DetermineFinalDocumentSettingsResult,
    fileToDocument,
    fileToTextDocument,
    isBinaryFile,
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

export async function clearCachedFiles(): Promise<void> {
    await Promise.all([clearCachedSettingsFiles(), refreshDictionaryCache(0)]);
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    return getDictionaryInternal(toInternalSettings(settings));
}
