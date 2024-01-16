import * as GS from 'gensequence';
import * as util from 'util';

import { affFlag, flagToLongStringMap, flagToStringMap } from './affConstants.js';
import type {
    AffInfo,
    AffTransformFlags,
    AffWord,
    AffWordFlags,
    FlagRule,
    Fx,
    PfxRule,
    Rule,
    SfxRule,
    Substitution,
    SubstitutionsForRegExp,
} from './affDef.js';
import { Converter } from './converter.js';
import { filterOrderedList, isDefined } from './util.js';

const log = false;

// cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDFORBIDFLAG COMPOUNDMIDDLE COMPOUNDMIN COMPOUNDLAST FORBIDWARN
// cspell:ignore FORBIDDENWORD KEEPCASE NEEDAFFIX

/** The `word` field in a Converted AffWord has been converted using the OCONV mapping */
export type ConvertedAffWord = AffWord;

const DefaultMaxDepth = 5;

export class AffCompiler {
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
        const convert = this._oConv.convert.bind(this._oConv);
        const results = this.applyRulesToWord(asAffWord(word, rules), maxSuffixDepth).map(
            (affWord) => ((affWord.word = convert(affWord.word)), affWord),
        );
        results.sort(compareAff);
        const filtered = results.filter(filterAff());
        return filtered;
    }

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffWord, remainingDepth: number): AffWord[] {
        const compoundMin = this.affInfo.COMPOUNDMIN ?? 3;
        const { word, base, suffix, prefix, dic } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = reduceAffixRules(affWord, allRules);
        const rules = this.joinRules(allRules.filter((rule) => !rule.flags).map((rule) => rule.id));
        const affixRules = allRules.map((rule) => rule.sfx || rule.pfx).filter(isDefined);
        const wordWithFlags = { word, flags, rulesApplied, rules: '', base, suffix, prefix, dic };
        return [wordWithFlags, ...this.applyAffixesToWord(affixRules, { ...wordWithFlags, rules }, remainingDepth)]
            .filter(({ flags }) => !flags.isNeedAffix)
            .map((affWord) => adjustCompounding(affWord, compoundMin))
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
            .flatMap((affix) => this.applyAffixToWord(affix, affWord, combinableSfx))
            .flatMap((affWord) => this.applyRulesToWord(affWord, remainingDepth - 1));
        return r;
    }

    applyAffixToWord(affix: Fx, affWord: AffWord, combinableSfx: string): AffWord[] {
        const { word } = affWord;
        const combineRules = affix.type === 'PFX' && affix.combinable && !!combinableSfx ? combinableSfx : '';
        const flags = affWord.flags.isNeedAffix ? removeNeedAffix(affWord.flags) : affWord.flags;
        const matchingSubstitutions = affix.substitutionsForRegExps.filter((sub) => sub.match.test(word));
        const partialAffWord = { ...affWord, flags, rules: combineRules };
        return matchingSubstitutions
            .flatMap((sub) => this.#applySubstitution(affix, partialAffWord, sub))
            .map((affWord) => logAffWord(affWord, 'applyAffixToWord'));
    }

    #substituteAttach(affix: Fx, affWord: AffWord, sub: Substitution, stripped: string): AffWord {
        const { word: origWord, rulesApplied, flags, dic } = affWord;
        const rules = affWord.rules + (sub.attachRules || '');
        let word: string;
        let p = affWord.prefix.length;
        let s = origWord.length - affWord.suffix.length;
        if (sub.type === 'S') {
            word = stripped + sub.attach;
            s = Math.min(stripped.length, s);
            p = Math.min(p, s);
        } else {
            word = sub.attach + stripped;
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

    #applySubstitution(affix: Fx, affWord: AffWord, subs: SubstitutionsForRegExp): AffWord[] {
        const results: AffWord[] = [];
        for (const [replace, substitutions] of subs.substitutionsGroupedByRemove) {
            if (!replace.test(affWord.word)) continue;
            const stripped = affWord.word.replace(replace, '');
            for (const sub of substitutions) {
                results.push(this.#substituteAttach(affix, affWord, sub, stripped));
            }
        }
        return results;
    }

    getMatchingRules(rules: string): Rule[] {
        const { AF = [] } = this.affInfo;
        const idx = parseInt(rules, 10);
        const rulesToSplit = AF[idx] || rules;
        return this.separateRules(rulesToSplit)
            .map((key) => this.rules.get(key))
            .filter(isDefined);
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
        .filter((e) => !!e[1])
        .map((f) => flagToStringMap[f[0]])
        .sort()
        .join('');
    return word + '|' + sig;
}

export function processRules(affInfo: AffInfo): Map<string, Rule> {
    const sfxRules: SfxRule[] = [...(affInfo.SFX || [])]
        .map(([, sfx]) => sfx)
        .map((sfx) => ({ id: sfx.id, type: 'sfx', sfx }));
    const pfxRules: PfxRule[] = [...(affInfo.PFX || [])]
        .map(([, pfx]) => pfx)
        .map((pfx) => ({ id: pfx.id, type: 'pfx', pfx }));
    const flagRules: FlagRule[] = [
        ...GS.sequenceFromObject(affInfo as AffTransformFlags)
            .filter(([key, value]) => !!affFlag[key] && !!value)
            .map(([key, value]) => ({ id: value!, type: 'flag', flags: affFlag[key] })),
    ];

    const rules = [...sfxRules, ...pfxRules, ...flagRules].reduce((acc, rule) => {
        acc.set(rule.id, rule);
        return acc;
    }, new Map<string, Rule>());

    return rules;
}

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
    return [...Object.entries(flags)]
        .filter(([, v]) => !!v)
        .map(([k]) => flagToLongStringMap[k])
        .sort()
        .join(':');
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

function reduceAffixRules(
    affWord: Pick<AffWord, 'flags' | 'rulesApplied'>,
    allRules: Rule[],
): { rulesApplied: string; flags: AffWordFlags } {
    return allRules
        .filter((rule) => !!rule.flags)
        .reduce(
            (acc, rule) => ({
                rulesApplied: [acc.rulesApplied, rule.id].join(' '),
                flags: { ...acc.flags, ...rule.flags },
            }),
            { rulesApplied: affWord.rulesApplied, flags: affWord.flags },
        );
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

function adjustCompounding(affWord: AffWord, minLength: number): AffWord {
    if (!affWord.flags.isCompoundPermitted || affWord.word.length >= minLength) {
        return affWord;
    }

    const { isCompoundPermitted: _, ...flags } = affWord.flags;
    affWord.flags = flags;
    return affWord;
}

// cspell:ignore straat uppercased

enum AffixFlags {
    /**
     * COMPOUNDFLAG flag
     *
     * Words signed with COMPOUNDFLAG may be in compound words (except when word shorter than COMPOUNDMIN).
     * Affixes with COMPOUNDFLAG also permits compounding of affixed words.
     *
     */
    isCompoundPermitted = 1 << 0,
    /**
     * COMPOUNDBEGIN flag
     *
     * Words signed with COMPOUNDBEGIN (or with a signed affix) may be first elements in compound words.
     *
     */
    canBeCompoundBegin = 1 << 1, // default false
    /**
     * COMPOUNDMIDDLE flag
     *
     * Words signed with COMPOUNDMIDDLE (or with a signed affix) may be middle elements in compound words.
     *
     */
    canBeCompoundMiddle = 1 << 2, // default false
    /**
     * COMPOUNDLAST flag
     *
     * Words signed with COMPOUNDLAST (or with a signed affix) may be last elements in compound words.
     *
     */
    canBeCompoundEnd = 1 << 3, // default false
    /**
     * COMPOUNDPERMITFLAG flag
     *
     * Prefixes are allowed at the beginning of compounds, suffixes are allowed at the end of compounds by default.
     * Affixes with COMPOUNDPERMITFLAG may be inside of compounds.
     *
     */
    isOnlyAllowedInCompound = 1 << 4,
    /**
     * COMPOUNDFORBIDFLAG flag
     *
     * Suffixes with this flag forbid compounding of the affixed word.
     *
     */
    isCompoundForbidden = 1 << 5,
    /**
     * WARN flag
     *
     * This flag is for rare words, which are also often spelling mistakes, see option -r of command line Hunspell and FORBIDWARN.
     */
    isWarning = 1 << 6,
    /**
     * KEEPCASE flag
     *
     * Forbid uppercased and capitalized forms of words signed with KEEPCASE flags. Useful for special orthographies (measurements and
     * currency often keep their case in uppercased texts) and writing systems (e.g. keeping lower case of IPA characters). Also valuable
     * for words erroneously written in the wrong case.
     */
    isKeepCase = 1 << 7,
    /**
     * FORCEUCASE flag
     *
     * Last word part of a compound with flag FORCEUCASE forces capitalization of the whole compound word.
     * Eg. Dutch word "straat" (street) with FORCEUCASE flags will allowed only in capitalized compound forms,
     * according to the Dutch spelling rules for proper names.
     */
    isForceUCase = 1 << 8,
    /**
     * FORBIDDENWORD flag
     *
     * This flag signs forbidden word form. Because affixed forms are also forbidden, we can subtract a subset from set of the
     * accepted affixed and compound words. Note: useful to forbid erroneous words, generated by the compounding mechanism.
     */
    isForbiddenWord = 1 << 9,
    /**
     * NOSUGGEST flag
     *
     * Words signed with NOSUGGEST flag are not suggested (but still accepted when typed correctly). Proposed flag for vulgar
     * and obscene words (see also SUBSTANDARD).
     */
    isNoSuggest = 1 << 10,
    // cspell:ignore pseudoroot
    /**
     * NEEDAFFIX flag
     *
     * This flag signs virtual stems in the dictionary, words only valid when affixed. Except, if the dictionary word has a homonym
     * or a zero affix. NEEDAFFIX works also with prefixes and prefix + suffix combinations (see tests/pseudoroot5.*).
     */
    isNeedAffix = 1 << 11,

    /** Indicates if a Suffix/Prefix can be combined with a Prefix/Suffix */
    isCombinable = 1 << 12,
}

type SuffixId = number;

interface SuffixTree {
    id: SuffixId;
    /** Unique suffix entry, `suffix/flags` */
    sfx: string;
    text: string;
    flags: AffixFlags;
    c?: SuffixId[];
}

interface CompiledWords {
    words: SuffixId[];
    suffixes: SuffixTree[];
}

function toAffixFlags(flags: AffWordFlags): AffixFlags {
    let result = 0;
    for (const [key, value] of Object.entries(flags) as [keyof AffWordFlags, boolean | undefined][]) {
        if (value) {
            const flag = AffixFlags[key];
            result |= flag;
        }
    }
    return result;
}

interface Dictionary {}
