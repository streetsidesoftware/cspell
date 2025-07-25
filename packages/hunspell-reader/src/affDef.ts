// cspell:words uppercased
// cspell:words KEEPCASE WARN NEEDAFFIX FORCEUCASE FORBIDDENWORD NOSUGGEST WORDCHARS
// cspell:words COMPOUNDBEGIN COMPOUNDMIDDLE COMPOUNDEND COMPOUNDPERMITFLAG COMPOUNDFORBIDFLAG
// cspell:words MAXDIFF COMPOUNDMIN COMPOUNDRULE COMPOUNDFLAG COMPOUNDLAST FORBIDWARN

export interface Fx {
    type: 'PFX' | 'SFX';
    id: string;
    combinable: boolean;
    substitutionSets: Substitutions;
    substitutionsForRegExps: SubstitutionsForRegExp[];
    count?: string | undefined; // number of line items for this rule.
    extra?: string[] | undefined; // extra items on the line.
}

export type Substitutions = Map<string, SubstitutionsForRegExp>;

export interface Substitution {
    type: 'P' | 'S';
    remove: string;
    attach: string;
    attachRules?: string | undefined;
    replace: RegExp;
    extra?: string | undefined;
}

export interface SubstitutionsForRegExp {
    match: RegExp;
    substitutions: Substitution[];
    substitutionsGroupedByRemove: Map<RegExp, Substitution[]>;
}

export interface Rep {
    match: string;
    replaceWith: string;
}

export interface Conv {
    from: string;
    to: string;
}

export interface AffTransformFlags {
    KEEPCASE?: string | undefined;
    WARN?: string | undefined;
    NEEDAFFIX?: string | undefined;
    FORCEUCASE?: string | undefined;
    FORBIDDENWORD?: string | undefined;
    NOSUGGEST?: string | undefined;
    COMPOUNDBEGIN?: string | undefined;
    COMPOUNDEND?: string | undefined;
    COMPOUNDFLAG?: string | undefined;
    COMPOUNDFORBIDFLAG?: string | undefined;
    COMPOUNDMIDDLE?: string | undefined;
    COMPOUNDPERMITFLAG?: string | undefined;
    ONLYINCOMPOUND?: string | undefined;
}

export interface AffInfo extends AffTransformFlags {
    SET: string; // Character set encoding of the .aff and .dic file
    TRY?: string | undefined;
    KEY?: string | undefined;
    WORDCHARS?: string | undefined;
    NOSPLITSUGS?: boolean | undefined;
    MAXCPDSUGS?: number | undefined;
    ONLYMAXDIFF?: boolean | undefined;
    MAXDIFF?: number | undefined;
    BREAK?: string[] | undefined;
    FLAG?: string | undefined; // 'long' | 'num'
    MAP?: string[] | undefined;
    ICONV?: Conv[] | undefined;
    OCONV?: Conv[] | undefined;
    REP?: Rep[] | undefined;
    AF?: string[] | undefined;
    COMPOUNDMIN?: number | undefined;
    COMPOUNDRULE?: string[] | undefined;
    CHECKCOMPOUNDCASE?: boolean | undefined;
    CHECKCOMPOUNDDUP?: boolean | undefined;
    CHECKCOMPOUNDREP?: boolean | undefined;
    CHECKCOMPOUNDPATTERN?: string[][] | undefined;
    PFX?: Map<string, Fx> | undefined;
    SFX?: Map<string, Fx> | undefined;
}

export type Rule = FlagRule | PfxRule | SfxRule;

interface RuleBase {
    id: string;
    type: string;
    flags?: AffWordFlags;
    pfx?: Fx;
    sfx?: Fx;
}

export interface FlagRule extends RuleBase {
    flags: AffWordFlags;
}

export interface PfxRule extends RuleBase {
    pfx: Fx;
}

export interface SfxRule extends RuleBase {
    sfx: Fx;
}

// cspell:ignore straat

/**
 * AffWordFlags are the flags applied to a word after the hunspell rules have been applied.
 * They are either `true` or `undefined`.
 */
export interface AffWordFlags {
    /**
     * COMPOUNDFLAG flag
     *
     * Words signed with COMPOUNDFLAG may be in compound words (except when word shorter than COMPOUNDMIN).
     * Affixes with COMPOUNDFLAG also permits compounding of affixed words.
     *
     */
    isCompoundPermitted?: true;
    /**
     * COMPOUNDBEGIN flag
     *
     * Words signed with COMPOUNDBEGIN (or with a signed affix) may be first elements in compound words.
     *
     */
    canBeCompoundBegin?: true; // default false
    /**
     * COMPOUNDMIDDLE flag
     *
     * Words signed with COMPOUNDMIDDLE (or with a signed affix) may be middle elements in compound words.
     *
     */
    canBeCompoundMiddle?: true; // default false
    /**
     * COMPOUNDLAST flag
     *
     * Words signed with COMPOUNDLAST (or with a signed affix) may be last elements in compound words.
     *
     */
    canBeCompoundEnd?: true; // default false
    /**
     * COMPOUNDPERMITFLAG flag
     *
     * Prefixes are allowed at the beginning of compounds, suffixes are allowed at the end of compounds by default.
     * Affixes with COMPOUNDPERMITFLAG may be inside of compounds.
     *
     */
    isOnlyAllowedInCompound?: true;
    /**
     * COMPOUNDFORBIDFLAG flag
     *
     * Suffixes with this flag forbid compounding of the affixed word.
     *
     */
    isCompoundForbidden?: true;
    /**
     * WARN flag
     *
     * This flag is for rare words, which are also often spelling mistakes, see option -r of command line Hunspell and FORBIDWARN.
     */
    isWarning?: true;
    /**
     * KEEPCASE flag
     *
     * Forbid uppercased and capitalized forms of words signed with KEEPCASE flags. Useful for special orthographies (measurements and
     * currency often keep their case in uppercased texts) and writing systems (e.g. keeping lower case of IPA characters). Also valuable
     * for words erroneously written in the wrong case.
     */
    isKeepCase?: true;
    /**
     * FORCEUCASE flag
     *
     * Last word part of a compound with flag FORCEUCASE forces capitalization of the whole compound word.
     * Eg. Dutch word "straat" (street) with FORCEUCASE flags will allowed only in capitalized compound forms,
     * according to the Dutch spelling rules for proper names.
     */
    isForceUCase?: true;
    /**
     * FORBIDDENWORD flag
     *
     * This flag signs forbidden word form. Because affixed forms are also forbidden, we can subtract a subset from set of the
     * accepted affixed and compound words. Note: useful to forbid erroneous words, generated by the compounding mechanism.
     */
    isForbiddenWord?: true;
    /**
     * NOSUGGEST flag
     *
     * Words signed with NOSUGGEST flag are not suggested (but still accepted when typed correctly). Proposed flag for vulgar
     * and obscene words (see also SUBSTANDARD).
     */
    isNoSuggest?: true;
    // cspell:ignore pseudoroot
    /**
     * NEEDAFFIX flag
     *
     * This flag signs virtual stems in the dictionary, words only valid when affixed. Except, if the dictionary word has a homonym
     * or a zero affix. NEEDAFFIX works also with prefixes and prefix + suffix combinations (see tests/pseudoroot5.*).
     */
    isNeedAffix?: true;
}

export interface AffWord {
    word: string;
    rules: string;
    flags: AffWordFlags;
    rulesApplied: string;
    /** prefix + base + suffix == word */
    base: string; // the base
    suffix: string; // suffixes applied
    prefix: string; // prefixes applied
    dic: string; // dictionary entry
}
