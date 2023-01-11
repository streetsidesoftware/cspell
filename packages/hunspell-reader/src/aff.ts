import * as GS from 'gensequence';
import type { Sequence } from 'gensequence';
import { genSequence as gs } from 'gensequence';
import * as util from 'util';
import type { AffInfo, AffTransformFlags, AffWord, AffWordFlags, Fx, Rule, Substitution } from './affDef';
import { Converter } from './converter';
import type { Mapping } from './types';
import { filterOrderedList, isDefined } from './util';

const log = false;

// cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDFORBIDFLAG COMPOUNDMIDDLE COMPOUNDMIN
// cspell:ignore FORBIDDENWORD KEEPCASE NEEDAFFIX

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
        const compoundMin = this.affInfo.COMPOUNDMIN ?? 3;
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
    const sfxRules: Sequence<Rule> = gs(affInfo.SFX || [])
        .map(([, sfx]) => sfx)
        .map((sfx) => ({ id: sfx.id, type: 'sfx', sfx }));
    const pfxRules: Sequence<Rule> = gs(affInfo.PFX || [])
        .map(([, pfx]) => pfx)
        .map((pfx) => ({ id: pfx.id, type: 'pfx', pfx }));
    const flagRules: Sequence<Rule> = GS.sequenceFromObject(affInfo as AffTransformFlags)
        .filter(([key, value]) => !!affFlag[key] && !!value)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(([key, value]) => ({ id: value!, type: 'flag', flags: affFlag[key] }));

    const rules = sfxRules
        .concat(pfxRules)
        .concat(flagRules)
        .reduce<Map<string, Rule>>((acc, rule) => {
            acc.set(rule.id, rule);
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

const flagToStringMap: Record<string, string | undefined> = _FlagToStringMap;
const flagToLongStringMap: Record<string, string | undefined> = _FlagToLongStringMap;

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
