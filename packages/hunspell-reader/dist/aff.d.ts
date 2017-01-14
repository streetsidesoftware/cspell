import * as Conv from './converter';
export interface Fx {
    type: string;
    id: string;
    combinable: boolean;
    substitutions: Substitutions[];
}
export interface Substitutions {
    match: RegExp;
    remove: string;
    attach: string;
    attachRules?: string;
    replace: RegExp;
    extra: string[];
}
export interface Rep {
    match: string;
    replaceWith: string;
}
export interface Conv {
    from: string;
    to: string;
}
export interface AffInfo {
    SET?: string;
    TRY?: string;
    KEY?: string;
    WORDCHARS?: string;
    NOSPLITSUGS?: boolean;
    MAXCPDSUGS?: number;
    ONLYMAXDIFF?: boolean;
    MAXDIFF?: number;
    KEEPCASE?: string;
    WARN?: string;
    NEEDAFFIX?: string;
    FORCEUCASE?: string;
    BREAK?: number;
    FLAG?: string;
    FORBIDDENWORD?: string;
    NOSUGGEST?: string;
    MAP?: string[];
    ICONV?: Conv[];
    OCONV?: Conv[];
    REP?: Rep[];
    AF?: string[];
    COMPOUNDMIN?: number;
    COMPOUNDRULE?: string[];
    CHECKCOMPOUNDCASE?: boolean;
    COMPOUNDBEGIN?: string;
    COMPOUNDMIDDLE?: string;
    COMPOUNDEND?: string;
    COMPOUNDPERMITFLAG?: string;
    ONLYINCOMPOUND?: string;
    CHECKCOMPOUNDDUP?: boolean;
    CHECKCOMPOUNDREP?: boolean;
    CHECKCOMPOUNDPATTERN?: string[][];
    PFX?: Dictionary<Fx>;
    SFX?: Dictionary<Fx>;
}
export interface Rule {
    id: string;
    type: string;
    flags?: AffWordFlags;
    pfx?: Fx;
    sfx?: Fx;
}
export interface AffWordFlags {
    isCompoundPermitted?: boolean;
    canBeCompoundBegin?: boolean;
    canBeCompoundMiddle?: boolean;
    canBeCompoundEnd?: boolean;
    isOnlyAllowedInCompound?: boolean;
    isWarning?: boolean;
    isKeepCase?: boolean;
    isForceUCase?: boolean;
    isForbiddenWord?: boolean;
    isNoSuggest?: boolean;
    isNeedAffix?: boolean;
}
export interface AffWord {
    word: string;
    rules: string;
    flags: AffWordFlags;
    rulesApplied: string;
}
export declare class Aff {
    affInfo: AffInfo;
    protected rules: Dictionary<Rule>;
    protected _oConv: Conv.Converter;
    protected _iConv: Conv.Converter;
    constructor(affInfo: AffInfo);
    applyRulesToDicEntry(line: string): AffWord[];
    applyRulesToWord(affWord: AffWord): AffWord[];
    applyAffixesToWord(affixRules: Fx[], affWord: AffWord): AffWord[];
    applyAffixToWord(affix: Fx, affWord: AffWord, combinableSfx: string): AffWord[];
    getMatchingRules(rules: string): Rule[];
    separateRules(rules: string): string[];
    readonly iConv: Conv.Converter;
    readonly oConv: Conv.Converter;
}
export declare function processRules(affInfo: AffInfo): Dictionary<Rule>;
export declare function logAffWord(affWord: AffWord, message: string): AffWord;
export declare function affWordToColoredString(affWord: AffWord): string;
export declare function flagsToString(flags: AffWordFlags): string;
