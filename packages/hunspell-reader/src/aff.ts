import * as util from 'util';
import {Converter} from './converter';
import {genSequence as gs, Sequence} from 'gensequence';
import * as GS from 'gensequence';
import { Dictionary } from './types';

// cSpell:enableCompoundWords

const log = false;

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
    extra?: string[];
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
    COMPOUNDMIDDLE?: string;
    COMPOUNDEND?: string;
    COMPOUNDPERMITFLAG?: string;
    ONLYINCOMPOUND?: string;
};

export interface AffInfo extends AffTransformFlags {
    SET?: string;       // Characterset encoding of the .aff and .dic file
    TRY?: string;
    KEY?: string;
    WORDCHARS?: string;
    NOSPLITSUGS?: boolean;
    MAXCPDSUGS?: number;
    ONLYMAXDIFF?: boolean;
    MAXDIFF?: number;
    BREAK?: number;
    FLAG?: string;  // 'long' | 'num'
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
    isNeedAffix?: boolean;
}

export interface AffWord {
    word: string;
    rules: string;
    flags: AffWordFlags;
    rulesApplied: string;
    base: string;           // the base
    suffix: string;         // suffixes applied
    prefix: string;         // prefixes applied
    dic: string;            // dictionary entry
}

export class Aff {
    protected rules: Map<string, Rule>;
    protected _oConv: Converter;
    protected _iConv: Converter;

    constructor(public affInfo: AffInfo) {
        this.rules = processRules(affInfo);
        this._iConv = new Converter(affInfo.ICONV || []);
        this._oConv = new Converter(affInfo.OCONV || []);
    }

    /**
     * Takes a line from a hunspell.dic file and applies the rules found in the aff file.
     * @param {string} line - the line from the .dic file.
     */
    applyRulesToDicEntry(line: string): AffWord[] {
        const [lineLeft] = line.split(/\s+/, 1);
        const [word, rules = ''] = lineLeft.split('/', 2);
        return this.applyRulesToWord(asAffWord(word, rules))
            .map(affWord => ({...affWord, word: this._oConv.convert(affWord.word) }));
    }

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffWord): AffWord[] {
        const { word, base, suffix, prefix, dic } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = allRules
            .filter(rule => !!rule.flags)
            .reduce((acc, rule) => ({
                rulesApplied: [acc.rulesApplied, rule.id].join(' '),
                flags: {...acc.flags, ...rule.flags},
            }), { rulesApplied: affWord.rulesApplied, flags: affWord.flags});
        const rules = this.joinRules(allRules.filter(rule => !rule.flags).map(rule => rule.id));
        const affixRules = allRules.map(rule => rule.sfx! || rule.pfx!).filter(a => !!a);
        const wordWithFlags = {word, flags, rulesApplied, rules: '', base, suffix, prefix, dic};
        return [
            wordWithFlags,
            ...this.applyAffixesToWord(affixRules, { ...wordWithFlags, rules })
        ]
        .filter(({flags}) => !flags.isNeedAffix)
        .map(affWord => logAffWord(affWord, 'applyRulesToWord'))
        ;
    }

    applyAffixesToWord(affixRules: Fx[], affWord: AffWord): AffWord[] {
        const combineableRules = affixRules
            .filter(rule => rule.type === 'SFX')
            .filter(rule => rule.combinable === true)
            .map(({id}) => id);
        const combinableSfx = this.joinRules(combineableRules);
        const r = affixRules
            .map(affix => this.applyAffixToWord(affix, affWord, combinableSfx))
            .reduce((a, b) => a.concat(b), [])
            .map(affWord => this.applyRulesToWord(affWord))
            .reduce((a, b) => a.concat(b), [])
            ;
        return r;
    }

    applyAffixToWord(affix: Fx, affWord: AffWord, combinableSfx: string): AffWord[] {
        const {word} = affWord;
        const combineRules = (affix.type === 'PFX' && affix.combinable && !!combinableSfx)
            ? combinableSfx
            : '';
        const flags = { ...affWord.flags, isNeedAffix: false };
        const matchingSubstitutions = [...affix.substitutionSets.values()]
            .filter(sub => sub.match.test(word));
        const partialAffWord = {...affWord, flags, rules: combineRules};
        return matchingSubstitutions
            .map(sub => sub.substitutions)
            .reduce((a, b) => a.concat(b), [])
            .filter(sub => sub.replace.test(word))
            .map(sub => this.substitute(affix, partialAffWord, sub))
            .map(affWord => logAffWord(affWord, 'applyAffixToWord'))
            ;
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
            .map(key => this.rules[key])
            .filter(a => !!a);
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
                return rules.replace(/(..)/g, '$1//').split('//').slice(0, -1);
            case 'num':
                return rules.split(',');
        }
        return rules.split('');
    }

    get iConv() {
        return this._iConv;
    }

    get oConv() {
        return this._oConv;
    }
}

export function processRules(affInfo: AffInfo): Map<string, Rule> {
    const sfxRules: Sequence<Rule> = gs(affInfo.SFX || []).map(([, sfx]) => sfx).map(sfx => ({ id: sfx.id, type: 'sfx', sfx }));
    const pfxRules: Sequence<Rule> = gs(affInfo.PFX || []).map(([, pfx]) => pfx).map(pfx => ({ id: pfx.id, type: 'pfx', pfx }));
    const flagRules: Sequence<Rule> = GS.sequenceFromObject(affInfo as AffTransformFlags)
        .filter(([key, value]) => !!affFlag[key] && !!value)
        .map(([key, value]) => ({ id: value!, type: 'flag', flags: affFlag[key]}));

    const rules = sfxRules.concat(pfxRules).concat(flagRules)
        .reduce<Map<string, Rule>>((acc, rule) => { acc[rule.id] = rule; return acc; }, new Map<string, Rule>());
    return rules;
}

const affFlag: Dictionary<AffWordFlags> = {
    KEEPCASE          : { isKeepCase             : true },
    WARN              : { isWarning              : true },
    FORCEUCASE        : { isForceUCase           : true },
    FORBIDDENWORD     : { isForbiddenWord        : true },
    NOSUGGEST         : { isNoSuggest            : true },
    NEEDAFFIX         : { isNeedAffix            : true },
    COMPOUNDBEGIN     : { canBeCompoundBegin     : true },
    COMPOUNDMIDDLE    : { canBeCompoundMiddle    : true },
    COMPOUNDEND       : { canBeCompoundEnd       : true },
    COMPOUNDPERMITFLAG: { isCompoundPermitted    : true },
    ONLYINCOMPOUND    : { isOnlyAllowedInCompound: true },
};

const flagToStringMap: Dictionary<string> = {
    isCompoundPermitted    : 'C',
    canBeCompoundBegin     : 'B',
    canBeCompoundMiddle    : 'M',
    canBeCompoundEnd       : 'E',
    isOnlyAllowedInCompound: 'O',
    isWarning              : 'W',
    isKeepCase             : 'K',
    isForceUCase           : 'U',
    isForbiddenWord        : 'F',
    isNoSuggest            : 'N',
    isNeedAffix            : 'A',
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
    return util.inspect(
        {...affWord, flags: flagsToString(affWord.flags)},
        { showHidden: false, depth: 5, colors: true }).replace(/(\s|\n|\r)+/g, ' ');
}

/* istanbul ignore next */
export function flagsToString(flags: AffWordFlags) {
    return GS.sequenceFromObject(flags)
        .filter(([, v]) => !!v)
        // convert the key to a string
        .map(([k]) => flagToStringMap[k])
        .toArray()
        .sort()
        .join('_');
}

export function asAffWord(word: string, rules: string = ''): AffWord {
    return {
        word,
        base: word,
        prefix: '',
        suffix: '',
        rulesApplied: '',
        rules: rules || '',
        flags: {},
        dic: word + '/' + rules
    };
}
