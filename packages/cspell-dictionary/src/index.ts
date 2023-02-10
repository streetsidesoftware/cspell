export type {
    CachingDictionary,
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
} from './SpellingDictionary';
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
} from './SpellingDictionary';
