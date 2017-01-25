export { CSpellUserSettings, CSpellUserSettingsWithComments } from './CSpellSettingsDef';
export { WordOffset } from './util/text';
export { validateText } from './validator';
export { mergeSettings, readSettings, readSettingsFiles, defaultFileName as defaultSettingsFilename } from './CSpellSettingsServer';
export { SpellingDictionary, createSpellingDictionary, createSpellingDictionaryRx } from './SpellingDictionary';
export { getDefaultSettings } from './DefaultSettings';
export { getSettings as constructSettingsForText, getDictionary } from './TextDocumentSettings';

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