import { DictionaryDefinition, DictionaryId } from './CSpellSettingsDef';
import { SpellingDictionary } from './SpellingDictionary';
export declare function loadDictionaries(dictIds: DictionaryId[], defs: DictionaryDefinition[]): Promise<SpellingDictionary>[];
export declare type DefMapArrayItem = [string, DictionaryDefinition];
export declare function filterDictDefsToLoad(dictIds: DictionaryId[], defs: DictionaryDefinition[]): DefMapArrayItem[];
export declare function normalizePathForDictDefs(defs: DictionaryDefinition[], defaultPath: string): DictionaryDefinition[];
export declare function normalizePathForDictDef(def: DictionaryDefinition, defaultPath: string): DictionaryDefinition;
