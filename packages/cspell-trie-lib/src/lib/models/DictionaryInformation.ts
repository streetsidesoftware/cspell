import type { DictionaryDefinitionAugmented } from '@cspell/cspell-types';

export type DictionaryInformation = Exclude<DictionaryDefinitionAugmented['dictionaryInformation'], undefined>;
export type SuggestionEditCosts = Exclude<DictionaryInformation['suggestionEditCosts'], undefined>;
export type HunspellInformation = Exclude<DictionaryInformation['hunspellInformation'], undefined>;
export type HunspellCosts = Exclude<HunspellInformation['costs'], undefined>;
export type HunspellAff = HunspellInformation['aff'];
