export { CachingDictionary, createCachingDictionary } from './CachingDictionary.js';
export { createInlineSpellingDictionary } from './createInlineSpellingDictionary.js';
export { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary.js';
export {
    createFlagWordsDictionary,
    createFlagWordsDictionary as createForbiddenWordsDictionary,
} from './FlagWordsDictionary.js';
export { createIgnoreWordsDictionary } from './IgnoreWordsDictionary.js';
export type {
    DictionaryDefinitionInline,
    FindOptions,
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
} from './SpellingDictionary.js';
export { createCollection, SpellingDictionaryCollection } from './SpellingDictionaryCollection.js';
export { createSpellingDictionaryFromTrieFile } from './SpellingDictionaryFromTrie.js';
export { createSuggestDictionary } from './SuggestDictionary.js';
export type { SuggestOptions } from './SuggestOptions.js';
export { createSuggestOptions } from './SuggestOptions.js';
export { createTyposDictionary } from './TyposDictionary.js';
export { CompoundWordsMethod, type SuggestionCollector, type SuggestionResult } from 'cspell-trie-lib';
