export * from 'cspell-io';
export * from './Settings';
export { TextOffset, TextDocumentOffset } from './util/text';
export {
    checkText,
    CheckTextInfo,
    TextInfoItem,
    IncludeExcludeOptions,
    IncludeExcludeFlag,
    validateText,
} from './validator';
export { defaultFileName as defaultSettingsFilename } from './Settings';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    getDictionary,
    SpellingDictionary,
    SuggestionCollector,
    SuggestionResult,
    refreshDictionaryCache,
} from './SpellingDictionary';
export { combineTextAndLanguageSettings } from './Settings/TextDocumentSettings';
export { combineTextAndLanguageSettings as constructSettingsForText } from './Settings/TextDocumentSettings';

import * as Text from './util/text';
export { Text };

import * as ExclusionHelper from './exclusionHelper';
export { ExclusionHelper };
export {
    ExcludeFilesGlobMap,
    ExclusionFunction,
    Glob,
} from './exclusionHelper';

export { getLanguagesForExt } from './LanguageIds';
export * from './trace';

import { clearCachedFiles } from './Settings';
import { refreshDictionaryCache } from './SpellingDictionary';

export async function clearCachedSettings() {
    await Promise.all([clearCachedFiles(), refreshDictionaryCache(0)]);
}

export { clearCachedSettings as clearCachedFiles };
