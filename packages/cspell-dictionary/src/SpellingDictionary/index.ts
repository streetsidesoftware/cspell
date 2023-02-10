export { CachingDictionary, createCachingDictionary } from './CachingDictionary';
export { createInlineSpellingDictionary } from './createInlineSpellingDictionary';
export { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary';
export {
    createFlagWordsDictionary,
    createFlagWordsDictionary as createForbiddenWordsDictionary,
} from './FlagWordsDictionary';
export { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';
export type {
    DictionaryDefinitionInline,
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
export { createTyposDictionary } from './TyposDictionary';
