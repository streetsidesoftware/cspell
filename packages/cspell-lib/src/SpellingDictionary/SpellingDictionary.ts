import * as cspellDictModule from 'cspell-dictionary';
export { CompoundWordsMethod } from 'cspell-trie-lib';

const SpellingDictionaryModule = {
    createCollection: cspellDictModule.createCollection,
    createForbiddenWordsDictionary: cspellDictModule.createForbiddenWordsDictionary,
    createSpellingDictionary: cspellDictModule.createSpellingDictionary,
    createIgnoreWordsDictionary: cspellDictModule.createIgnoreWordsDictionary,
    createSpellingDictionaryFromTrieFile: cspellDictModule.createSpellingDictionaryFromTrieFile,
} as const;

type SpellDictInterface = typeof SpellingDictionaryModule;

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
} from 'cspell-dictionary';

export function getSpellDictInterface(): SpellDictInterface {
    return SpellingDictionaryModule;
}

export const createSpellingDictionary = getSpellDictInterface().createSpellingDictionary;
export const createCollection = getSpellDictInterface().createCollection;
