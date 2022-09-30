export { CachingDictionary, createCachingDictionary } from './CachingDictionary';
export { createSpellingDictionary, createFailedToLoadDictionary } from './createSpellingDictionary';
export { createForbiddenWordsDictionary } from './ForbiddenWordsDictionary';
export { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';
export type {
    FindOptions,
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestionCollector,
    SuggestionResult,
    SuggestOptions,
} from './SpellingDictionary';
export { createCollection, SpellingDictionaryCollection } from './SpellingDictionaryCollection';
export { createSpellingDictionaryFromTrieFile } from './SpellingDictionaryFromTrie';
