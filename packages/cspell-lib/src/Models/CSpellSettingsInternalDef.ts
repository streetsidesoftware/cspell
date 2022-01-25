import {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
} from '@cspell/cspell-types';
import { WeightMap } from 'cspell-trie-lib';

export const SymbolCSpellSettingsInternal = Symbol('CSpellSettingsInternal');

export interface CSpellSettingsInternal extends Omit<CSpellSettingsWithSourceTrace, 'dictionaryDefinitions'> {
    [SymbolCSpellSettingsInternal]: true;
    dictionaryDefinitions?: DictionaryDefinitionInternal[];
}

type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;

export interface DictionaryDefinitionInternal
    extends DictionaryDefinitionPreferred,
        Partial<DictionaryDefinitionCustomUniqueFields>,
        DictionaryDefinitionAugmented {
    /**
     * Optional weight map used to improve suggestions.
     */
    weightMap?: WeightMap;
    /** The path to the config file that contains this dictionary definition */
    __source?: string;
}

export interface DictionaryDefinitionInternalWithSource extends DictionaryDefinitionInternal {
    __source: string;
}

export function createCSpellSettingsInternal(parts: Partial<CSpellSettingsInternal> = {}): CSpellSettingsInternal {
    return {
        ...parts,
        [SymbolCSpellSettingsInternal]: true,
    };
}

export function isCSpellSettingsInternal(
    cs: CSpellSettingsInternal | CSpellSettingsWithSourceTrace
): cs is CSpellSettingsInternal {
    return !!(<CSpellSettingsInternal>cs)[SymbolCSpellSettingsInternal];
}
