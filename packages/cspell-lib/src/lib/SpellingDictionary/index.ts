export type { DictionaryNameFields } from './Dictionaries.js';
export {
    getDictionaryInternal,
    getInlineConfigDictionaries,
    loadDictionaryDefs,
    mapSpecialDictionaryNamesToSettings,
    refreshDictionaryCache,
    specialDictionaryNames,
} from './Dictionaries.js';
export type {
    FindOptions,
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryCollection,
    SpellingDictionaryOptions,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary.js';
export {
    CompoundWordsMethod,
    createCollection,
    createInlineSpellingDictionary,
    createSpellingDictionary,
} from './SpellingDictionary.js';
export { isSpellingDictionaryLoadError, SpellingDictionaryLoadError } from './SpellingDictionaryError.js';
