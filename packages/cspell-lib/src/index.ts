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
export {
    calcOverrideSettings,
    defaultFileName as defaultSettingsFilename,
    mergeSettings,
    readSettings,
    readSettingsFiles,
} from './Settings';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    getDictionary,
    SpellingDictionary,
    SuggestionCollector,
    SuggestionResult,
} from './SpellingDictionary';
export { getDefaultSettings, getGlobalSettings } from './Settings';
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
import { refreshDictionaryCache } from './SpellingDictionary'

export async function clearCachedSettings() {
    await Promise.all([
        clearCachedFiles(),
        refreshDictionaryCache(),
    ]);
}

export { clearCachedSettings as clearCachedFiles };
