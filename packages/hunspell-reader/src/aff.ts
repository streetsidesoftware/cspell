import * as util from 'util';
import { Converter } from './converter';
import { genSequence as gs, Sequence } from 'gensequence';
import * as GS from 'gensequence';
import { Mapping } from './types';
import { filterOrderedList } from './util';

const log = false;

// cspell:words uppercased
// cspell:words KEEPCASE WARN NEEDAFFIX FORCEUCASE FORBIDDENWORD NOSUGGEST WORDCHARS
// cspell:words COMPOUNDBEGIN COMPOUNDMIDDLE COMPOUNDEND COMPOUNDPERMITFLAG COMPOUNDFORBIDFLAG
// cspell:words MAXDIFF COMPOUNDMIN COMPOUNDRULE COMPOUNDFLAG COMPOUNDLAST FORBIDWARN

export interface Fx {
    type: string;
    id: string;
    combinable: boolean;
    substitutionSets: Substitutions;
    count?: string; // number of line items for this rule.
    extra?: string[]; // extra items on the line.
}

export type Substitutions = Map<string, SubstitutionSet>;

export interface Substitution {
    remove: string;
    attach: string;
    attachRules?: string;
    replace: RegExp;
    extra?: string;
}

export interface SubstitutionSet {
    match: RegExp;
    substitutions: Substitution[];
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
    KEEPCASE?: string;
    WARN?: string;
    NEEDAFFIX?: string;
    FORCEUCASE?: string;
    FORBIDDENWORD?: string;
    NOSUGGEST?: string;
    COMPOUNDBEGIN?: string;
    COMPOUNDEND?: string;
    COMPOUNDFLAG?: string;
    COMPOUNDFORBIDFLAG?: string;
    COMPOUNDMIDDLE?: string;
    COMPOUNDPERMITFLAG?: string;
    ONLYINCOMPOUND?: string;
}

export interface AffInfo extends AffTransformFlags {
    SET: string; // Character set encoding of the .aff and .dic file
    TRY?: string;
    KEY?: string;
    WORDCHARS?: string;
    NOSPLITSUGS?: boolean;
    MAXCPDSUGS?: number;
    ONLYMAXDIFF?: boolean;
    MAXDIFF?: number;
    BREAK?: number;
    FLAG?: string; // 'long' | 'num'
    MAP?: string[];
    ICONV?: Conv[];
    OCONV?: Conv[];
    REP?: Rep[];
    AF?: string[];
    COMPOUNDMIN?: number;
    COMPOUNDRULE?: string[];
    CHECKCOMPOUNDCASE?: boolean;
    CHECKCOMPOUNDDUP?: boolean;
    CHECKCOMPOUNDREP?: boolean;
    CHECKCOMPOUNDPATTERN?: string[][];
    PFX?: Map<string, Fx>;
    SFX?: Map<string, Fx>;
}

export interface Rule {
    id: string;
    type: string;
    flags?: AffWordFlags;
    pfx?: Fx;
    sfx?: Fx;
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

/** The `word` field in a Converted AffWord has been converted using the OCONV mapping */
export type ConvertedAffWord = AffWord;

const DefaultMaxDepth = 5;

export class Aff {
    protected rules: Map<string, Rule>;
    protected _oConv: Converter;
    protected _iConv: Converter;
    private _maxSuffixDepth = DefaultMaxDepth;

    constructor(public affInfo: AffInfo) {
        this.rules = processRules(affInfo);
        this._iConv = new Converter(affInfo.ICONV || []);
        this._oConv = new Converter(affInfo.OCONV || []);
    }

    public get maxSuffixDepth() {
        return this._maxSuffixDepth;
    }

    public set maxSuffixDepth(value: number) {
        this._maxSuffixDepth = value;
    }

    /**
     * Takes a line from a hunspell.dic file and applies the rules found in the aff file.
     * For performance reasons, only the `word` field is mapped with OCONV.
     * @param {string} line - the line from the .dic file.
     */
    applyRulesToDicEntry(line: string, maxDepth?: number): ConvertedAffWord[] {
        const maxSuffixDepth = maxDepth ?? this.maxSuffixDepth;
        const [lineLeft] = line.split(/\s+/, 1);
        const [word, rules = ''] = lineLeft.split('/', 2);
        const results = this.applyRulesToWord(asAffWord(word, rules), maxSuffixDepth).map((affWord) => ({
            ...affWord,
            word: this._oConv.convert(affWord.word),
        }));
        results.sort(compareAff);
        const filtered = results.filter(filterAff());
        return filtered;
    }

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffWord, remainingDepth: number): AffWord[] {
        const { word, base, suffix, prefix, dic } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = allRules
            .filter((rule) => !!rule.flags)
            .reduce(
                (acc, rule) => ({
                    rulesApplied: [acc.rulesApplied, rule.id].join(' '),
                    flags: { ...acc.flags, ...rule.flags },
                }),
                { rulesApplied: affWord.rulesApplied, flags: affWord.flags }
            );
        const rules = this.joinRules(allRules.filter((rule) => !rule.flags).map((rule) => rule.id));
        const affixRules = allRules.map((rule) => rule.sfx! || rule.pfx!).filter((a) => !!a);
        const wordWithFlags = { word, flags, rulesApplied, rules: '', base, suffix, prefix, dic };
        return [wordWithFlags, ...this.applyAffixesToWord(affixRules, { ...wordWithFlags, rules }, remainingDepth)]
            .filter(({ flags }) => !flags.isNeedAffix)
            .map((affWord) => logAffWord(affWord, 'applyRulesToWord'));
    }

    applyAffixesToWord(affixRules: Fx[], affWord: AffWord, remainingDepth: number): AffWord[] {
        if (remainingDepth <= 0) {
            return [];
        }
        const combinableRules = affixRules
            .filter((rule) => rule.type === 'SFX')
            .filter((rule) => rule.combinable === true)
            .map(({ id }) => id);
        const combinableSfx = this.joinRules(combinableRules);
        const r = affixRules
            .map((affix) => this.applyAffixToWord(affix, affWord, combinableSfx))
            .reduce((a, b) => a.concat(b), [])
            .map((affWord) => this.applyRulesToWord(affWord, remainingDepth - 1))
            .reduce((a, b) => a.concat(b), []);
        return r;
    }

    applyAffixToWord(affix: Fx, affWord: AffWord, combinableSfx: string): AffWord[] {
        const { word } = affWord;
        const combineRules = affix.type === 'PFX' && affix.combinable && !!combinableSfx ? combinableSfx : '';
        const flags = affWord.flags.isNeedAffix ? removeNeedAffix(affWord.flags) : affWord.flags;
        const matchingSubstitutions = [...affix.substitutionSets.values()].filter((sub) => sub.match.test(word));
        const partialAffWord = { ...affWord, flags, rules: combineRules };
        return matchingSubstitutions
            .map((sub) => sub.substitutions)
            .reduce((a, b) => a.concat(b), [])
            .filter((sub) => sub.remove === '0' || sub.replace.test(word))
            .map((sub) => this.substitute(affix, partialAffWord, sub))
            .map((affWord) => logAffWord(affWord, 'applyAffixToWord'));
    }

    substitute(affix: Fx, affWord: AffWord, sub: Substitution): AffWord {
        const { word: origWord, rulesApplied, flags, dic } = affWord;
        const rules = affWord.rules + (sub.attachRules || '');
        const word = origWord.replace(sub.replace, sub.attach);
        const stripped = origWord.replace(sub.replace, '');
        let p = affWord.prefix.length;
        let s = origWord.length - affWord.suffix.length;
        if (affix.type === 'SFX') {
            s = Math.min(stripped.length, s);
            p = Math.min(p, s);
        } else {
            const d = word.length - origWord.length;
            p = Math.max(p, word.length - stripped.length);
            s = Math.max(s + d, p);
        }
        const base = word.slice(p, s);
        const prefix = word.slice(0, p);
        const suffix = word.slice(s);
        return {
            word,
            rulesApplied: rulesApplied + ' ' + affix.id,
            rules,
            flags,
            base,
            suffix,
            prefix,
            dic,
        };
    }

    getMatchingRules(rules: string): Rule[] {
        const { AF = [] } = this.affInfo;
        const rulesToSplit = AF[rules] || rules;
        return this.separateRules(rulesToSplit)
            .map((key) => this.rules[key])
            .filter((a) => !!a);
    }

    joinRules(rules: string[]): string {
        switch (this.affInfo.FLAG) {
            case 'long':
                return rules.join('');
            case 'num':
                return rules.join(',');
        }
        return rules.join('');
    }

    separateRules(rules: string): string[] {
        switch (this.affInfo.FLAG) {
            case 'long':
                return [...new Set(rules.replace(/(..)/g, '$1//').split('//').slice(0, -1))];
            case 'num':
                return [...new Set(rules.split(','))];
        }
        return [...new Set(rules.split(''))];
    }

    get iConv() {
        return this._iConv;
    }

    get oConv() {
        return this._oConv;
    }
}

function signature(aff: AffWord) {
    const { word, flags } = aff;
    const sig = Object.entries(flags)
        .filter((e) => e[1])
        .map((f) => flagToStringMap[f[0]])
        .sort()
        .join('');
    return word + '|' + sig;
}

export function processRules(affInfo: AffInfo): Map<string, Rule> {
    const sfxRules: Sequence<Rule> = gs(affInfo.SFX || [])
        .map(([, sfx]) => sfx)
        .map((sfx) => ({ id: sfx.id, type: 'sfx', sfx }));
    const pfxRules: Sequence<Rule> = gs(affInfo.PFX || [])
        .map(([, pfx]) => pfx)
        .map((pfx) => ({ id: pfx.id, type: 'pfx', pfx }));
    const flagRules: Sequence<Rule> = GS.sequenceFromObject(affInfo as AffTransformFlags)
        .filter(([key, value]) => !!affFlag[key] && !!value)
        .map(([key, value]) => ({ id: value!, type: 'flag', flags: affFlag[key] }));

    const rules = sfxRules
        .concat(pfxRules)
        .concat(flagRules)
        .reduce<Map<string, Rule>>((acc, rule) => {
            acc[rule.id] = rule;
            return acc;
        }, new Map<string, Rule>());
    return rules;
}

const affFlag: Mapping<AffTransformFlags, AffWordFlags> = {
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

const flagToStringMap: Mapping<AffWordFlags, string> = {
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

export function logAffWord(affWord: AffWord, message: string) {
    /* istanbul ignore if */
    if (log) {
        const dump = util.inspect(affWord, { showHidden: false, depth: 5, colors: true });
        console.log(`${message}: ${dump}`);
    }
    return affWord;
}

/* istanbul ignore next */
export function affWordToColoredString(affWord: AffWord) {
    return util
        .inspect({ ...affWord, flags: flagsToString(affWord.flags) }, { showHidden: false, depth: 5, colors: true })
        .replace(/(\s|\n|\r)+/g, ' ');
}

/* istanbul ignore next */
export function flagsToString(flags: AffWordFlags) {
    return (
        GS.sequenceFromObject(flags)
            .filter(([, v]) => !!v)
            // convert the key to a string
            .map(([k]) => flagToStringMap[k])
            .toArray()
            .sort()
            .join('_')
    );
}

export function asAffWord(word: string, rules = '', flags: AffWordFlags = {}): AffWord {
    return {
        word,
        base: word,
        prefix: '',
        suffix: '',
        rulesApplied: '',
        rules,
        flags,
        dic: rules ? word + '/' + rules : word,
    };
}

export function compareAff(a: AffWord, b: AffWord) {
    if (a.word !== b.word) {
        return a.word < b.word ? -1 : 1;
    }
    const sigA = signature(a);
    const sigB = signature(b);
    return sigA < sigB ? -1 : sigA > sigB ? 1 : 0;
}

/**
 * Returns a filter function that will filter adjacent AffWords
 * It compares the word and the flags.
 */
export function filterAff() {
    return filterOrderedList<AffWord>((a, b) => a.word !== b.word || signature(a) !== signature(b));
}

export const debug = {
    signature,
};

function removeNeedAffix(flags: AffWordFlags): AffWordFlags {
    const newFlags: AffWordFlags = { ...flags };
    delete newFlags.isNeedAffix;
    return newFlags;
}
