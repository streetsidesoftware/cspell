import * as util from 'util';
import {Converter} from './converter';
import {genSequence as gs, Sequence} from 'gensequence';
import * as GS from 'gensequence';

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
    SET?: string;
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
        return this.applyRulesToWord({word, rules, flags: {}, rulesApplied: ''})
            .map(affWord => ({...affWord, word: this._oConv.convert(affWord.word) }));
    }

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffWord): AffWord[] {
        const { word } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = allRules
            .filter(rule => !!rule.flags)
            .reduce((acc, rule) => ({
                rulesApplied: [acc.rulesApplied, rule.id].join(' '),
                flags: {...acc.flags, ...rule.flags},
            }), { rulesApplied: affWord.rulesApplied, flags: affWord.flags});
        const rules = allRules.filter(rule => !rule.flags).map(rule => rule.id).join('');
        const affixRules = allRules.map(rule => rule.sfx! || rule.pfx!).filter(a => !!a);
        const wordWithFlags = {word, flags, rulesApplied, rules: ''};
        return [
            wordWithFlags,
            ...this.applyAffixesToWord(affixRules, { ...wordWithFlags, rules })
        ]
        .filter(({flags}) => !flags.isNeedAffix)
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
        return [...affix.substitutionSets.values()]
            .filter(sub => sub.match.test(word))
            .map(sub => sub.substitutions)
            .reduce((a, b) => a.concat(b), [])
            .filter(sub => sub.replace.test(word))
            .map(sub => ({
                word: word.replace(sub.replace, sub.attach),
                rulesApplied: [affWord.rulesApplied, affix.id].join(' '),
                rules: combineRules + (sub.attachRules || ''),
                flags
            }))
            .map(affWord => logAffWord(affWord, 'applyAffixToWord'))
            ;
    }

    getMatchingRules(rules: string): Rule[] {
        const { AF = [] } = this.affInfo;
        const rulesToSplit = AF[rules] || rules;
        return this.separateRules(rulesToSplit)
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
    if (log) {
        const dump = util.inspect(affWord, { showHidden: false, depth: 5, colors: true });
        console.log(`${message}: ${dump}`);
    }
    return affWord;
}

export function affWordToColoredString(affWord: AffWord) {
    return util.inspect(
        {...affWord, flags: flagsToString(affWord.flags)},
        { showHidden: false, depth: 5, colors: true }).replace(/(\s|\n|\r)+/g, ' ');
}

export function flagsToString(flags: AffWordFlags) {
    return GS.sequenceFromObject(flags)
        .filter(([, v]) => !!v)
        // convert the key to a string
        .map(([k]) => flagToStringMap[k])
        .toArray()
        .sort()
        .join('_');
}

