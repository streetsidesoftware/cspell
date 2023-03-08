import type {
    AdvancedCSpellSettingsWithSourceTrace,
    CSpellSettingsWithSourceTrace,
    DictionaryDefinition,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryDefinitionInline,
    DictionaryDefinitionPreferred,
    Parser,
} from '@cspell/cspell-types';
import type { WeightMap } from 'cspell-trie-lib';

import type { OptionalOrUndefined } from '../util/types.js';
import { clean } from '../util/util.js';

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

export type DictionaryDefinitionInternal = DictionaryFileDefinitionInternal | DictionaryDefinitionInlineInternal;

export type DictionaryDefinitionInlineInternal = DictionaryDefinitionInline & {
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
};

export interface DictionaryFileDefinitionInternal
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

export interface DictionaryFileDefinitionInternalWithSource extends DictionaryFileDefinitionInternal {
    readonly __source: string;
}

export type DictionaryDefinitionInternalWithSource = DictionaryDefinitionInternal & {
    readonly __source: string;
};

export function cleanCSpellSettingsInternal(
    parts: OptionalOrUndefined<Partial<CSpellSettingsInternal>> = {}
): CSpellSettingsInternal {
    const csi = clean(parts as CSpellSettingsInternal);
    Object.assign(csi, { [SymbolCSpellSettingsInternal]: true });
    return csi;
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

export function isDictionaryDefinitionInlineInternal(
    def: DictionaryDefinitionInternal | DictionaryDefinitionInline | DictionaryDefinition
): def is DictionaryDefinitionInlineInternal {
    if (def.path) return false;
    const defInline = def as DictionaryDefinitionInline;
    return !!(defInline.words || defInline.flagWords || defInline.ignoreWords || defInline.suggestWords);
}
