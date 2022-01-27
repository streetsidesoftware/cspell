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
    extends Readonly<DictionaryDefinitionPreferred>,
        Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>,
        Readonly<DictionaryDefinitionAugmented> {
    /**
     * Optional weight map used to improve suggestions.
     */
    readonly weightMap: WeightMap | undefined;
    /** The path to the config file that contains this dictionary definition */
    readonly __source: string | undefined;
}

export interface DictionaryDefinitionInternalWithSource extends DictionaryDefinitionInternal {
    readonly __source: string;
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
