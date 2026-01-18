import type {
    AdvancedCSpellSettingsWithSourceTrace,
    CSpellSettingsWithSourceTrace,
    Parser,
} from '@cspell/cspell-types';

import type { OptionalOrUndefined } from '../../util/types.js';
import { clean } from '../../util/util.js';
import type { DictionaryDefinitionInternal } from './InternalDictionaryDef.js';

export const SymbolCSpellSettingsInternal: unique symbol = Symbol('CSpellSettingsInternal');

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

export function cleanCSpellSettingsInternal(
    parts?: OptionalOrUndefined<Partial<CSpellSettingsInternal>>,
): CSpellSettingsInternal {
    return parts
        ? Object.assign(clean(parts), { [SymbolCSpellSettingsInternal]: true })
        : { [SymbolCSpellSettingsInternal]: true };
}

export function createCSpellSettingsInternal(
    parts?: OptionalOrUndefined<Partial<CSpellSettingsInternal>>,
): CSpellSettingsInternal {
    return cleanCSpellSettingsInternal({ ...parts });
}

export function isCSpellSettingsInternal(
    cs:
        | CSpellSettingsInternal
        | CSpellSettingsWithSourceTrace
        | OptionalOrUndefined<CSpellSettingsInternal | CSpellSettingsWithSourceTrace>,
): cs is CSpellSettingsInternal {
    return !!(<CSpellSettingsInternal>cs)[SymbolCSpellSettingsInternal];
}
