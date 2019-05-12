import { DictionaryDefinition, DictionaryId, CSpellUserSettings } from '../Settings';
import { SpellingDictionary } from './SpellingDictionary';
import { SpellingDictionaryCollection } from './index';
export declare function loadDictionaries(dictIds: DictionaryId[], defs: DictionaryDefinition[]): Promise<SpellingDictionary>[];
export declare function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionaryCollection>;
