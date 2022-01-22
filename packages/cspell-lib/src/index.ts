import * as ExclusionHelper from './exclusionHelper';
import { clearCachedSettingsFiles } from './Settings';
import * as Link from './Settings/link';
import { refreshDictionaryCache } from './SpellingDictionary';
import * as Text from './util/text';

export * from 'cspell-io';
export { ExcludeFilesGlobMap, ExclusionFunction } from './exclusionHelper';
export { getLanguagesForExt } from './LanguageIds';
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
    isBinaryFile,
    spellCheckDocument,
    spellCheckFile,
    SpellCheckFileOptions,
    SpellCheckFileResult,
} from './spellCheckFile';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    getDictionary,
    isSpellingDictionaryLoadError,
    refreshDictionaryCache,
    SpellingDictionary,
    SpellingDictionaryCollection,
    SpellingDictionaryLoadError,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary';
export { traceWords } from './trace';
export type { TraceOptions, TraceResult } from './trace';
export { suggestionsForWord, suggestionsForWords, SuggestionError } from './suggestions';
export type { SuggestedWord, SuggestionOptions, SuggestionsForWordResult } from './suggestions';
export { getLogger, Logger, setLogger } from './util/logger';
export { resolveFile } from './util/resolveFile';
export {
    checkText,
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
