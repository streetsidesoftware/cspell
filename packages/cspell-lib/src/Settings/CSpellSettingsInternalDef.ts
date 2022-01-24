import {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
} from '@cspell/cspell-types';

export const SymbolCSpellSettingsInternal = Symbol('CSpellSettingsInternal');

export interface CSpellSettingsInternal extends Omit<CSpellSettingsWithSourceTrace, 'dictionaryDefinitions'> {
    [SymbolCSpellSettingsInternal]: true;
    dictionaryDefinitions?: DictionaryDefinitionInternal[];
}

type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;

export interface DictionaryDefinitionInternal
    extends DictionaryDefinitionPreferred,
        Partial<DictionaryDefinitionCustomUniqueFields>,
        DictionaryDefinitionAugmented {}

export interface DictionaryDefinitionWithSource extends DictionaryDefinitionInternal {
    /** The path to the config file that contains this dictionary definition */
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
