import * as _ from 'lodash';
import {merge} from 'tsmerge';
import * as util from 'util';

const log = false;

export interface Fx {
    type: string;
    id: string;
    combinable: boolean;
    substitutions: Substitutions[];
}

export interface Dictionary<T>{
    [index: string]: T;
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
    FORCEUCASE?: string;
    BREAK?: number;
    FLAG?: string;  // 'long' | 'num'
    FORBIDDENWORD?: string;
    NOSUGGEST?: string;
    MAP?: string[];
    ICONV?: Conv[];
    OCONV?: Conv[];
    REP?: Rep[];
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
    isCompoundPermitted?: boolean;   // default false
    canBeCompoundBegin?: boolean;    // default false
    canBeCompoundMiddle?: boolean;   // default false
    canBeCompoundEnd?: boolean;      // default false
    isOnlyAllowedInCompound?: boolean; // default false
    isWarning?: boolean;
    isKeepCase?: boolean;
    isForceUCase?: boolean;
    isForbiddenWord?: boolean;
    isNoSuggest?: boolean;
}

export interface AffWord {
    word: string;
    rules: string;
    flags: AffWordFlags;
    rulesApplied: string;
}

export class Aff {
    protected rules: Dictionary<Rule>;

    constructor(public affInfo: AffInfo) {
        this.rules = processRules(affInfo);
    }

    applyRulesToDicEntry(line: string): AffWord[] {
        const [word, rules = ''] = line.split('/');
        return this.applyRulesToWord({word, rules, flags: {}, rulesApplied: ''});
    }

    applyRulesToWord(affWord: AffWord): AffWord[] {
        const { word } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = allRules
            .filter(rule => !!rule.flags)
            .reduce((acc, rule) => ({
                rulesApplied: acc.rulesApplied + rule.id,
                flags: merge(acc.flags, rule.flags)
            }), { rulesApplied: affWord.rulesApplied, flags: inheritFlags(affWord.flags)});
        const rules = allRules.filter(rule => !rule.flags);
        const affixRules = allRules.map(rule => rule.sfx || rule.pfx).filter(a => !!a);
        const wordWithFlags = {word, flags, rulesApplied, rules: ''};
        return [
            wordWithFlags,
            ...this.applyAffixesToWord(affixRules, merge(wordWithFlags, { rules }))
        ]
        .map(affWord => logAffWord(affWord, 'applyRulesToWord'))
        ;
    }

    applyAffixesToWord(affixRules: Fx[], affWord: AffWord): AffWord[] {
        const combinableSfx = affixRules
            .filter(rule => rule.type === 'SFX')
            .filter(rule => rule.combinable === true)
            .map(({id}) => id)
            .join('');
        const r = affixRules
            .map(affix => this.applyAffixToWord(affix, affWord, combinableSfx))
            .reduce<AffWord[]>((acc, v) => [...acc, ...v], [])
            .map(affWord => this.applyRulesToWord(affWord))
            .reduce<AffWord[]>((acc, v) => [...acc, ...v], []);
        return r;
    }

    applyAffixToWord(affix: Fx, affWord: AffWord, combinableSfx: string): AffWord[] {
        const {word} = affWord;
        const combineRules = (affix.type === 'PFX' && affix.combinable && !!combinableSfx)
            ? combinableSfx
            : '';
        return affix.substitutions
            .filter(sub => !!word.match(sub.match))
            .map<AffWord>(sub => ({
                word: word.replace(sub.replace, sub.attach),
                rulesApplied: affWord.rulesApplied + affix.id,
                rules: combineRules + (sub.attachRules || ''),
                flags: affWord.flags
            }))
            .map(affWord => logAffWord(affWord, 'applyAffixToWord'))
            ;
    }

    getMatchingRules(rules: string): Rule[] {
        return this.separateRules(rules)
            .map(key => this.rules[key])
            .filter(a => !!a);
    }

    separateRules(rules: string): string[] {
        if (this.affInfo.FLAG === 'long') {
            return rules.replace(/(..)/g, '$1//').split('//').slice(0, -1);
        } else {
            return rules.split('');
        }
    }
}

export function processRules(affInfo: AffInfo): Dictionary<Rule> {
    const sfxRules = _(affInfo.SFX).map((sfx: Fx) => ({ id: sfx.id, type: 'sfx', sfx }))
        .reduce<Dictionary<Rule>>((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    const pfxRules = _(affInfo.PFX).map((pfx: Fx) => ({ id: pfx.id, type: 'pfx', pfx }))
        .reduce<Dictionary<Rule>>((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    const flagRules = _(affInfo).map((value, key) => ({value, key}))
        .filter(({key}) => !!affFlag[key])
        .map(({value, key}) => ({ id: value, type: 'flag', flags: affFlag[key] }))
        .reduce<Dictionary<Rule>>((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    return merge(sfxRules, pfxRules, flagRules);
}

export function inheritFlags(flags: AffWordFlags): AffWordFlags {
    return _(flags).map((value: boolean, key: string) => ({key, value}))
        .filter(({key}) => inheritedFlags[key])
        .reduce<AffWordFlags>((acc, flag) => merge(acc, {[flag.key]: flag.value}), {});
}

const affFlag: Dictionary<AffWordFlags> = {
    KEEPCASE: { isKeepCase: true },
    WARN: { isWarning: true },
    FORCEUCASE: { isForceUCase: true },
    FORBIDDENWORD: { isForbiddenWord: true },
    NOSUGGEST: { isNoSuggest: true },
    CHECKCOMPOUNDCASE: {},
    COMPOUNDBEGIN: { canBeCompoundBegin: true },
    COMPOUNDMIDDLE: { canBeCompoundMiddle: true },
    COMPOUNDEND: { canBeCompoundEnd: true },
    COMPOUNDPERMITFLAG: { isCompoundPermitted: true },
    ONLYINCOMPOUND: { isOnlyAllowedInCompound: true },
};

const inheritedFlags: Dictionary<boolean> = {
    isCompoundPermitted: false,
    canBeCompoundBegin: false,
    canBeCompoundMiddle: false,
    canBeCompoundEnd: true,
    isOnlyAllowedInCompound: false,
    isWarning: true,
    isKeepCase: true,
    isForceUCase: true,
    isForbiddenWord: true,
    isNoSuggest: true
};

const flagToStringMap: Dictionary<string> = {
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
};

export function logAffWord(affWord: AffWord, message: string) {
    if (log) {
        const dump = util.inspect(affWord, { showHidden: false, depth: 5, colors: true });
        console.log(`${message}: ${dump}`);
    }
    return affWord;
}

export function flagsToString(flags: AffWordFlags) {
    return _(flags)
        // pair the key/value
        .map((v: boolean, k: string) => ({ v, k }))
        // remove any false values
        .filter(({v}) => v)
        // convert the key to a string
        .map(({k}) => flagToStringMap[k])
        .sort()
        .join('_');
}