import { CSpellUserSettings } from '@cspell/cspell-types';
import * as ExclusionHelper from './exclusionHelper';
import { clearCachedSettingsFiles } from './Settings';
import { toInternalSettings } from './Settings/CSpellSettingsServer';
import * as Link from './Settings/index.link';
import { getDictionaryInternal, refreshDictionaryCache, SpellingDictionaryCollection } from './SpellingDictionary';
import * as Text from './util/text';

export * from '@cspell/cspell-types';
export {
    asyncIterableToArray,
    readFile,
    readFileSync,
    writeToFile,
    writeToFileIterable,
    writeToFileIterableP,
} from 'cspell-io';
export { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper';
export { getLanguagesForExt } from './LanguageIds';
export { createTextDocument, updateTextDocument } from './Models/TextDocument';
export type { CreateTextDocumentParams, TextDocument, TextDocumentLine } from './Models/TextDocument';
export * from './Settings';
export { defaultFileName as defaultSettingsFilename } from './Settings';
export {
    combineTextAndLanguageSettings,
    combineTextAndLanguageSettings as constructSettingsForText,
} from './Settings/TextDocumentSettings';
export {
    determineFinalDocumentSettings,
    DetermineFinalDocumentSettingsResult,
    Document,
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
    isSpellingDictionaryLoadError,
    refreshDictionaryCache,
    SpellingDictionary,
    SpellingDictionaryCollection,
    SpellingDictionaryLoadError,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary';
export { SuggestionError, suggestionsForWord, suggestionsForWords } from './suggestions';
export type { SuggestedWord, SuggestionOptions, SuggestionsForWordResult } from './suggestions';
export { DocumentValidator, DocumentValidatorOptions } from './textValidation';
export { traceWords, traceWordsAsync } from './trace';
export type { TraceOptions, TraceResult } from './trace';
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
export { Text, Link };
export { ExclusionHelper };

export async function clearCachedFiles(): Promise<void> {
    await Promise.all([clearCachedSettingsFiles(), refreshDictionaryCache(0)]);
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection> {
    return getDictionaryInternal(toInternalSettings(settings));
}
