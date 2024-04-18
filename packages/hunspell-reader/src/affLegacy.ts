import * as util from 'node:util';

import * as GS from 'gensequence';

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

// cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDFORBIDFLAG COMPOUNDMIDDLE COMPOUNDMIN
// cspell:ignore FORBIDDENWORD KEEPCASE NEEDAFFIX

/** The `word` field in a Converted AffWord has been converted using the OCONV mapping */
export type ConvertedAffWord = AffWord;

const DefaultMaxDepth = 5;

const regExpIsNumber = /^\d+$/;

export class Aff {
    protected rules: Map<string, Rule>;
    protected _oConv: Converter;
    protected _iConv: Converter;
    private _maxSuffixDepth = DefaultMaxDepth;
    private _mapRules: Map<string, string[]> = new Map();

    constructor(
        readonly affInfo: AffInfo,
        readonly filename?: string,
    ) {
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
        const convert = this._oConv.convert;
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
        const idx = regExpIsNumber.test(rules) ? Number.parseInt(rules, 10) : -1;
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
        const found = this._mapRules.get(rules);
        if (found) return found;
        const split = this.#separateRules(rules);
        this._mapRules.set(rules, split);
        return split;
    }

    #separateRules(rules: string): string[] {
        switch (this.affInfo.FLAG) {
            case 'long':
                return [...new Set(rules.replaceAll(/(..)/g, '$1//').split('//').slice(0, -1))];
            case 'num':
                return [...new Set(rules.split(','))];
        }
        return [...new Set(rules)];
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
    const flagRules: FlagRule[] = GS.sequenceFromObject(affInfo as AffTransformFlags)
        .filter(([key, value]) => !!affFlag[key] && !!value)
        .map(([key, value]) => ({ id: value!, type: 'flag', flags: affFlag[key] }))
        .toArray();
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
        .replaceAll(/(\s|\n|\r)+/g, ' ');
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
