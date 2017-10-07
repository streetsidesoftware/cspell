export * from './Settings';
export { TextOffset, TextDocumentOffset } from './util/text';
export { validateText } from './validator';
export {
    calcOverrideSettings,
    clearCachedFiles as clearCachedSettings,
    defaultFileName as defaultSettingsFilename,
    mergeSettings,
    readSettings,
    readSettingsFiles,
} from './Settings';
export {
    CompoundWordsMethod,
    createSpellingDictionary,
    createSpellingDictionaryRx,
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
