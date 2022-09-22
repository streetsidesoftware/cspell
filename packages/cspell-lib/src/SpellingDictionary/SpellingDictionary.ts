import * as cspellDictModule from 'cspell-dictionary';
import { getSystemFeatureFlags } from '../FeatureFlags';
import { SpellingDictionaryLibOld } from './SpellingDictionaryLibOld';
export { CompoundWordsMethod } from 'cspell-trie-lib';

const SpellingDictionaryModule = {
    createCollection: cspellDictModule.createCollection,
    createForbiddenWordsDictionary: cspellDictModule.createForbiddenWordsDictionary,
    createSpellingDictionary: cspellDictModule.createSpellingDictionary,
} as const;

type SpellDictInterface = typeof SpellingDictionaryModule | typeof SpellingDictionaryLibOld;

const flagUseCSpellDictionary = 'use-cspell-dictionary';
getSystemFeatureFlags().register(flagUseCSpellDictionary, 'Use the CSpell Dictionary module.');

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
    const useModule = getSystemFeatureFlags().getFlagBool(flagUseCSpellDictionary);
    return useModule ? SpellingDictionaryModule : SpellingDictionaryLibOld;
}

export const createSpellingDictionary = getSpellDictInterface().createSpellingDictionary;
export const createCollection = getSpellDictInterface().createCollection;
