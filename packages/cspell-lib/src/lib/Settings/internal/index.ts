export type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from './CSpellSettingsInternalDef.js';
export {
    cleanCSpellSettingsInternal,
    createCSpellSettingsInternal,
    isCSpellSettingsInternal,
} from './CSpellSettingsInternalDef.js';
export { calcDictionaryDefsToLoad, filterDictDefsToLoad, mapDictDefToInternal } from './DictionarySettings.js';
export type {
    DictionaryDefinitionInlineInternal,
    DictionaryDefinitionInternal,
    DictionaryDefinitionSimpleInternal,
    DictionaryFileDefinitionInternal,
} from './InternalDictionaryDef.js';
export { isDictionaryDefinitionInlineInternal, isDictionaryFileDefinitionInternal } from './InternalDictionaryDef.js';
