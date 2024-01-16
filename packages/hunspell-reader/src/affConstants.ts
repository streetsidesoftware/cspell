import type { AffTransformFlags, AffWordFlags } from './affDef.js';
import type { Mapping } from './types.js';

/*
 cspell:ignore KEEPCASE FORBIDDENWORD  NEEDAFFIX
 cspell:ignore COMPOUNDBEGIN COMPOUNDMIDDLE COMPOUNDEND  COMPOUNDFORBIDFLAG
 */

export const affFlag: Mapping<AffTransformFlags, AffWordFlags> = {
    KEEPCASE: { isKeepCase: true },
    WARN: { isWarning: true },
    FORCEUCASE: { isForceUCase: true },
    FORBIDDENWORD: { isForbiddenWord: true },
    NOSUGGEST: { isNoSuggest: true },
    NEEDAFFIX: { isNeedAffix: true },
    COMPOUNDBEGIN: { canBeCompoundBegin: true },
    COMPOUNDMIDDLE: { canBeCompoundMiddle: true },
    COMPOUNDEND: { canBeCompoundEnd: true },
    COMPOUNDFLAG: { isCompoundPermitted: true },
    COMPOUNDPERMITFLAG: { isCompoundPermitted: true },
    COMPOUNDFORBIDFLAG: { isCompoundForbidden: true },
    ONLYINCOMPOUND: { isOnlyAllowedInCompound: true },
};
const _FlagToStringMap: Record<keyof AffWordFlags, string> = {
    isCompoundPermitted: 'C',
    canBeCompoundBegin: 'B',
    canBeCompoundMiddle: 'M',
    canBeCompoundEnd: 'E',
    isOnlyAllowedInCompound: 'O',
    isWarning: 'W',
    isKeepCase: 'K',
    isForceUCase: 'U',
    isForbiddenWord: 'F',
    isNoSuggest: 'N',
    isNeedAffix: 'A',
    isCompoundForbidden: '-',
};
const _FlagToLongStringMap: Record<keyof AffWordFlags, string> = {
    isCompoundPermitted: 'CompoundPermitted',
    canBeCompoundBegin: 'CompoundBegin',
    canBeCompoundMiddle: 'CompoundMiddle',
    canBeCompoundEnd: 'CompoundEnd',
    isOnlyAllowedInCompound: 'OnlyInCompound',
    isWarning: 'Warning',
    isKeepCase: 'KeepCase',
    isForceUCase: 'ForceUpperCase',
    isForbiddenWord: 'Forbidden',
    isNoSuggest: 'NoSuggest',
    isNeedAffix: 'NeedAffix',
    isCompoundForbidden: 'CompoundForbidden',
};
export const flagToStringMap: Record<string, string | undefined> = _FlagToStringMap;
export const flagToLongStringMap: Record<string, string | undefined> = _FlagToLongStringMap;
