"use strict";
const _ = require("lodash");
const tsmerge_1 = require("tsmerge");
const util = require("util");
const Conv = require("./converter");
const log = false;
class Aff {
    constructor(affInfo) {
        this.affInfo = affInfo;
        this.rules = processRules(affInfo);
        this._iConv = new Conv.Converter(affInfo.ICONV || []);
        this._oConv = new Conv.Converter(affInfo.OCONV || []);
    }
    applyRulesToDicEntry(line) {
        const [lineLeft] = line.split(/\s+/, 1);
        const [word, rules = ''] = lineLeft.split('/', 2);
        return this.applyRulesToWord({ word, rules, flags: {}, rulesApplied: '' })
            .map(affWord => tsmerge_1.merge(affWord, { word: this._oConv.convert(affWord.word) }));
    }
    applyRulesToWord(affWord) {
        const { word } = affWord;
        const allRules = this.getMatchingRules(affWord.rules);
        const { rulesApplied, flags } = allRules
            .filter(rule => !!rule.flags)
            .reduce((acc, rule) => ({
            rulesApplied: [acc.rulesApplied, rule.id].join(' '),
            flags: tsmerge_1.merge(acc.flags, rule.flags)
        }), { rulesApplied: affWord.rulesApplied, flags: affWord.flags });
        const rules = allRules.filter(rule => !rule.flags);
        const affixRules = allRules.map(rule => rule.sfx || rule.pfx).filter(a => !!a);
        const wordWithFlags = { word, flags, rulesApplied, rules: '' };
        return [
            wordWithFlags,
            ...this.applyAffixesToWord(affixRules, tsmerge_1.merge(wordWithFlags, { rules }))
        ]
            .filter(({ flags }) => !flags.isNeedAffix)
            .map(affWord => logAffWord(affWord, 'applyRulesToWord'));
    }
    applyAffixesToWord(affixRules, affWord) {
        const combinableSfx = affixRules
            .filter(rule => rule.type === 'SFX')
            .filter(rule => rule.combinable === true)
            .map(({ id }) => id)
            .join('');
        const r = affixRules
            .map(affix => this.applyAffixToWord(affix, affWord, combinableSfx))
            .reduce((acc, v) => [...acc, ...v], [])
            .map(affWord => this.applyRulesToWord(affWord))
            .reduce((acc, v) => [...acc, ...v], []);
        return r;
    }
    applyAffixToWord(affix, affWord, combinableSfx) {
        const { word } = affWord;
        const combineRules = (affix.type === 'PFX' && affix.combinable && !!combinableSfx)
            ? combinableSfx
            : '';
        const flags = tsmerge_1.merge(affWord.flags, { isNeedAffix: false });
        return affix.substitutions
            .filter(sub => !!word.match(sub.match) && !!word.match(sub.replace))
            .map(sub => ({
            word: word.replace(sub.replace, sub.attach),
            rulesApplied: [affWord.rulesApplied, affix.id].join(' '),
            rules: combineRules + (sub.attachRules || ''),
            flags
        }))
            .map(affWord => logAffWord(affWord, 'applyAffixToWord'));
    }
    getMatchingRules(rules) {
        const { AF = [] } = this.affInfo;
        const rulesToSplit = AF[rules] || rules;
        return this.separateRules(rulesToSplit)
            .map(key => this.rules[key])
            .filter(a => !!a);
    }
    separateRules(rules) {
        if (this.affInfo.FLAG === 'long') {
            return rules.replace(/(..)/g, '$1//').split('//').slice(0, -1);
        }
        else {
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
exports.Aff = Aff;
function processRules(affInfo) {
    const sfxRules = _(affInfo.SFX).map((sfx) => ({ id: sfx.id, type: 'sfx', sfx }))
        .reduce((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    const pfxRules = _(affInfo.PFX).map((pfx) => ({ id: pfx.id, type: 'pfx', pfx }))
        .reduce((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    const flagRules = _(affInfo).map((value, key) => ({ value, key }))
        .filter(({ key }) => !!affFlag[key])
        .map(({ value, key }) => ({ id: value, type: 'flag', flags: affFlag[key] }))
        .reduce((acc, rule) => { acc[rule.id] = rule; return acc; }, Object.create(null));
    return tsmerge_1.merge(sfxRules, pfxRules, flagRules);
}
exports.processRules = processRules;
const affFlag = {
    KEEPCASE: { isKeepCase: true },
    WARN: { isWarning: true },
    FORCEUCASE: { isForceUCase: true },
    FORBIDDENWORD: { isForbiddenWord: true },
    NOSUGGEST: { isNoSuggest: true },
    NEEDAFFIX: { isNeedAffix: true },
    CHECKCOMPOUNDCASE: {},
    COMPOUNDBEGIN: { canBeCompoundBegin: true },
    COMPOUNDMIDDLE: { canBeCompoundMiddle: true },
    COMPOUNDEND: { canBeCompoundEnd: true },
    COMPOUNDPERMITFLAG: { isCompoundPermitted: true },
    ONLYINCOMPOUND: { isOnlyAllowedInCompound: true },
};
const flagToStringMap = {
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
};
function logAffWord(affWord, message) {
    if (log) {
        const dump = util.inspect(affWord, { showHidden: false, depth: 5, colors: true });
        console.log(`${message}: ${dump}`);
    }
    return affWord;
}
exports.logAffWord = logAffWord;
function affWordToColoredString(affWord) {
    return util.inspect(tsmerge_1.merge(affWord, { flags: flagsToString(affWord.flags) }), { showHidden: false, depth: 5, colors: true }).replace(/(\s|\n|\r)+/g, ' ');
}
exports.affWordToColoredString = affWordToColoredString;
function flagsToString(flags) {
    return _(flags)
        .map((v, k) => ({ v, k }))
        .filter(({ v }) => v)
        .map(({ k }) => flagToStringMap[k])
        .sort()
        .join('_');
}
exports.flagsToString = flagsToString;
//# sourceMappingURL=aff.js.map