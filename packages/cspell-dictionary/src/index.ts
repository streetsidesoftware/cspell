export {
    dictionaryCacheClearLog,
    dictionaryCacheEnableLogging,
    dictionaryCacheGetLog,
} from './SpellingDictionary/CachingDictionary.js';
export type {
    CachingDictionary,
    FindOptions,
    FindResult,
    HasOptions,
    PreferredSuggestion,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryCollection,
    SpellingDictionaryOptions,
    Suggestion,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary/index.js';
export {
    createCachingDictionary,
    createCollection,
    createFailedToLoadDictionary,
    createFlagWordsDictionary,
    createForbiddenWordsDictionary,
    createIgnoreWordsDictionary,
    createInlineSpellingDictionary,
    createSpellingDictionary,
    createSpellingDictionaryFromTrieFile,
    createSuggestDictionary,
    createSuggestOptions,
} from './SpellingDictionary/index.js';
