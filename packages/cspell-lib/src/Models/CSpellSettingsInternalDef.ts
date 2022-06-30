import {
    AdvancedCSpellSettingsWithSourceTrace,
    CSpellSettingsWithSourceTrace,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
    Parser,
} from '@cspell/cspell-types';
import { WeightMap } from 'cspell-trie-lib';
import { OptionalOrUndefined } from '../util/types';
import { clean } from '../util/util';

export const SymbolCSpellSettingsInternal = Symbol('CSpellSettingsInternal');

export interface CSpellSettingsInternal extends Omit<AdvancedCSpellSettingsWithSourceTrace, 'dictionaryDefinitions'> {
    [SymbolCSpellSettingsInternal]: true;
    dictionaryDefinitions?: DictionaryDefinitionInternal[];
}

export interface CSpellSettingsInternalFinalized extends CSpellSettingsInternal {
    parserFn: Parser | undefined;
    finalized: true;
    ignoreRegExpList: RegExp[];
    includeRegExpList: RegExp[];
}

type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;

export interface DictionaryDefinitionInternal
    extends Readonly<DictionaryDefinitionPreferred>,
        Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>,
        Readonly<DictionaryDefinitionAugmented> {
    /**
     * Optional weight map used to improve suggestions.
     */
    readonly weightMap?: WeightMap | undefined;
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
}

export interface DictionaryDefinitionInternalWithSource extends DictionaryDefinitionInternal {
    readonly __source: string;
}

export function createCSpellSettingsInternal(
    parts: OptionalOrUndefined<Partial<CSpellSettingsInternal>> = {}
): CSpellSettingsInternal {
    return clean({
        ...parts,
        [SymbolCSpellSettingsInternal]: true,
    });
}

export function isCSpellSettingsInternal(
    cs:
        | CSpellSettingsInternal
        | CSpellSettingsWithSourceTrace
        | OptionalOrUndefined<CSpellSettingsInternal | CSpellSettingsWithSourceTrace>
): cs is CSpellSettingsInternal {
    return !!(<CSpellSettingsInternal>cs)[SymbolCSpellSettingsInternal];
}
