import assert from 'node:assert';

import { affFlag } from './affConstants.js';
import type { AffInfo, AffTransformFlags, AffWordFlags, Fx, Substitution, SubstitutionsForRegExp } from './affDef.js';
import { Converter } from './converter.js';
import { filterOrderedList, groupByField, isDefined } from './util.js';

// cspell:ignore COMPOUNDBEGIN COMPOUNDEND COMPOUNDFORBIDFLAG COMPOUNDMIDDLE COMPOUNDMIN COMPOUNDLAST FORBIDWARN
// cspell:ignore FORBIDDENWORD KEEPCASE NEEDAFFIX
// cspell:ignore uppercased straat

/** The `word` field in a Converted AffWord has been converted using the OCONV mapping */
export interface ConvertedAffixWord extends AffixWord {
    originalWord: string;
}

const debug = false;

function logError(msg: string, ...args: unknown[]) {
    debug && console.error(msg, ...args);
}

const DefaultMaxDepth = 5;

export class Aff {
    protected affData: AffData;
    protected _oConv: Converter;
    protected _iConv: Converter;
    private _maxSuffixDepth = DefaultMaxDepth;

    constructor(
        readonly affInfo: AffInfo,
        filename: string,
    ) {
        this.affData = new AffData(affInfo, filename);
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
    applyRulesToDicEntry(line: string, maxDepth?: number): ConvertedAffixWord[] {
        const afWord = this.affData.dictLineToAffixWord(line);
        const maxSuffixDepth = maxDepth ?? this.maxSuffixDepth;
        const convert = this._oConv.convert;
        const results = this.applyRulesToWord(afWord, maxSuffixDepth).map((affWord) => ({
            ...affWord,
            word: convert(affWord.word),
            originalWord: affWord.word,
        }));
        results.sort(compareAff);
        const filtered = results.filter(filterAff());
        return filtered;
    }

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffixWord, remainingDepth: number): AffixWord[] {
        const compoundMin = this.affInfo.COMPOUNDMIN ?? 3;
        const { word, flags, dict, appliedRules } = affWord;
        const wordWithFlags: AffixWord = { word, rules: undefined, flags, dict, appliedRules };
        return [wordWithFlags, ...this.applyAffixesToWord(affWord, remainingDepth)]
            .filter(({ flags }) => !(flags & AffixFlags.isNeedAffix))
            .map((affWord) => adjustCompounding(affWord, compoundMin));
    }

    applyAffixesToWord(affWord: AffixWord, remainingDepth: number): AffixWord[] {
        if (remainingDepth <= 0 || !affWord.rules) {
            return [];
        }
        const rules = affWord.rules;
        const combinableSfx = rules.filter((r) => r.type === 'S' && r.fx.combinable);
        const r = affWord.rules
            .flatMap((affix) => this.applyAffixToWord(affix, affWord, combinableSfx))
            .flatMap((affWord) => this.applyRulesToWord(affWord, remainingDepth - 1));
        return r;
    }

    applyAffixToWord(rule: FxRule, affWord: AffixWord, combinableSfx: FxRule[]): AffixWord[] {
        const { word } = affWord;
        const combineRules = rule.type === 'P' && rule.fx.combinable ? combinableSfx : [];
        const flags = affWord.flags & ~AffixFlags.isNeedAffix;
        const matchingSubstitutions = rule.fx.substitutionsForRegExps.filter((sub) => sub.match.test(word));
        const source = {
            dict: affWord.dict,
            appliedRules: affWord.appliedRules ? [...affWord.appliedRules, rule.idx] : undefined,
        };
        const partialAffWord = this.affData.toAffixWord(source, word, flags, combineRules);
        return matchingSubstitutions.flatMap((sub) => this.#applySubstitution(partialAffWord, sub));
    }

    #substituteAttach(affWord: AffixWord, sub: AffSubstitution, stripped: string): AffixWord {
        const { flags } = affWord;
        const subRules = this.affData.getRulesForAffSubstitution(sub);
        const rules = joinRules(affWord.rules, subRules);
        let word: string;
        if (sub.type === 'S') {
            word = stripped + sub.attach;
        } else {
            word = sub.attach + stripped;
        }
        return this.affData.toAffixWord(affWord, word, flags, rules);
    }

    #applySubstitution(affWord: AffixWord, subs: AffSubstitutionsForRegExp): AffixWord[] {
        const results: AffixWord[] = [];
        for (const [replace, substitutions] of subs.substitutionsGroupedByRemove) {
            if (!replace.test(affWord.word)) continue;
            const stripped = affWord.word.replace(replace, '');
            for (const sub of substitutions) {
                results.push(this.#substituteAttach(affWord, sub, stripped));
            }
        }
        return results;
    }

    getMatchingRules(flags: string): AffRule[] {
        const rules = this.affData.getRules(flags);
        return rules;
    }

    /**
     * Convert the applied rule indexes to AFF Letters.
     * Requires that the affixWord was generated with trace mode turned on.
     * @param affixWord - the generated AffixWord.
     */
    getFlagsValuesForAffixWord(affixWord: AffixWord): string[] | undefined {
        const rules = this.affData.getRulesForIndexes(affixWord.appliedRules);
        return rules?.map((r) => r.id);
    }

    get iConv() {
        return this._iConv;
    }

    get oConv() {
        return this._oConv;
    }

    setTraceMode(value: boolean) {
        this.affData.trace = value;
    }
}

export function compareAff(a: AffixWord, b: AffixWord): number {
    return a.word < b.word ? -1 : a.word > b.word ? 1 : a.flags - b.flags;
}

/**
 * Returns a filter function that will filter adjacent AffWords
 * It compares the word and the flags.
 */
function filterAff() {
    return filterOrderedList<AffixWord>((a, b) => a.word !== b.word || a.flags !== b.flags);
}

function adjustCompounding(affWord: AffixWord, minLength: number): AffixWord {
    if (!(affWord.flags & AffixFlags.isCompoundPermitted) || affWord.word.length >= minLength) {
        return affWord;
    }
    affWord.flags &= ~AffixFlags.isCompoundPermitted;
    return affWord;
}

export enum AffixFlags {
    none = 0,
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

type RuleIdx = number;
type SingleFlag = string;
type WordFlags = string;

type DictionaryLine = string;

interface DictionaryEntry {
    word: string;
    /** flags are the part after the `/`, `word/FLAGS` */
    flags: string;
    /** The original dictionary line. */
    line: string;
}

export interface AffixWordSource {
    /** Original dictionary entry */
    dict: DictionaryEntry;
    /** Optional applied rules, trace mode must be turned on. */
    appliedRules?: number[] | undefined;
}

export interface AffixWord extends AffixWordSource {
    /** The word */
    word: string;
    /** Rules to apply */
    rules: FxRule[] | undefined;
    /** Flags */
    flags: AffixFlags;
}

class AffData {
    rules: AffRule[] = [];
    mapToRuleIdx: Map<SingleFlag, RuleIdx | RuleIdx[]> = new Map();
    mapWordRulesToRuleIndexes: Map<WordFlags, RuleIdx[]> = new Map();
    mapWordRulesToRules: Map<WordFlags, AffRule[]> = new Map();
    affFlagType: 'long' | 'num' | 'char';
    missingFlags: Set<string> = new Set();
    private _mapRuleIdxToRules = new WeakMap<RuleIdx[], AffRule[]>();
    public trace = false;

    constructor(
        private affInfo: AffInfo,
        readonly filename: string,
    ) {
        this.affFlagType = toAffFlagType(affInfo.FLAG);
        this.#processAffInfo(affInfo);
    }

    dictLineToEntry(line: DictionaryLine): DictionaryEntry {
        const [lineLeft] = line.split(/\s+/, 1);
        const [word, rules = ''] = lineLeft.split('/', 2);
        return { word, flags: rules, line };
    }

    dictLineToAffixWord(line: DictionaryLine): AffixWord {
        const entry = this.dictLineToEntry(line);
        return this.toAffixWord(
            { dict: entry, appliedRules: this.trace ? [] : undefined },
            entry.word,
            AffixFlags.none,
            this.getRules(entry.flags),
        );
    }

    toAffixWord(
        source: AffixWordSource | AffixWord,
        word: string,
        flags: AffixFlags,
        rules: AffRule[] | undefined,
    ): AffixWord {
        const dict = source.dict;
        let appliedRules = source.appliedRules;
        if (!rules) return { word, rules: undefined, flags, dict, appliedRules };
        const fxRules = rules.filter((rule): rule is FxRule => rule.type !== 'F');
        if (appliedRules) {
            appliedRules = [...appliedRules, ...rules.filter((r) => r.type === 'F').map((r) => r.idx)];
        }
        return {
            word,
            rules: fxRules.length ? fxRules : undefined,
            flags: flags | this.rulesToFlags(rules),
            appliedRules,
            dict,
        };
    }

    getRules(rules: WordFlags): AffRule[] {
        const foundRules = this.mapWordRulesToRules.get(rules);
        if (foundRules) return foundRules;
        const ruleIndexes = this.getRuleIndexes(rules);
        const affRules = ruleIndexes.map((idx) => this.rules[idx]);
        this.mapWordRulesToRules.set(rules, affRules);
        return affRules;
    }

    getRuleIndexes(rules: WordFlags): RuleIdx[] {
        const found = this.mapWordRulesToRuleIndexes.get(rules);
        if (found) return found;
        const indexes = this.#getRuleIndexes(rules);
        this.mapWordRulesToRuleIndexes.set(rules, indexes);
        return indexes;
    }

    rulesToFlags(rules: AffRule[]): AffixFlags {
        return rules.reduce((acc, rule) => acc | rule.flags, AffixFlags.none);
    }

    getRulesForIndexes(indexes: undefined): undefined;
    getRulesForIndexes(indexes: RuleIdx[]): AffRule[];
    getRulesForIndexes(indexes: RuleIdx[] | undefined): AffRule[] | undefined;
    getRulesForIndexes(indexes: RuleIdx[] | undefined): AffRule[] | undefined {
        if (!indexes) return undefined;
        let rules = this._mapRuleIdxToRules.get(indexes);
        if (rules) return rules;
        rules = indexes.map((idx) => this.rules[idx]);
        this._mapRuleIdxToRules.set(indexes, rules);
        return rules;
    }

    getRulesForAffSubstitution(sub: AffSubstitution): AffRule[] | undefined {
        return this.getRulesForIndexes(sub.attachRules);
    }

    #getRuleIndexes(rules: string): RuleIdx[] {
        const flags = this.#splitRules(rules);
        const indexes = flags
            .flatMap((flag) => {
                const found = this.mapToRuleIdx.get(flag);
                if (found === undefined && !this.missingFlags.has(flag)) {
                    this.missingFlags.add(flag);
                    const filename = this.filename;
                    logError('Unable to resolve flag: %o, for file: %o', flag, filename);
                    // throw new Error('Unable to resolve flag');
                }
                return found;
            })
            .filter(isDefined);
        return indexes;
    }

    #splitRules(rules: string): string[] {
        switch (this.affFlagType) {
            case 'long':
                return [...new Set(rules.replace(/(..)/g, '$1//').split('//').slice(0, -1))];
            case 'num':
                return [...new Set(rules.split(','))];
        }
        return [...new Set(rules.split(''))];
    }

    #processAffInfo(affInfo: AffInfo) {
        const { AF = [], SFX = [], PFX = [] } = affInfo;
        const flags: PartialRule[] = objectToKvP(affInfo as AffTransformFlags)
            .filter(isValidFlagMember)
            .map(([key, value]) => ({ id: value, flags: toAffixFlags(affFlag[key]) }));
        const sfxRules: PartialRule[] = [...SFX].map(([, sfx]) => sfx).map((sfx) => ({ id: sfx.id, sfx }));
        const pfxRules: PartialRule[] = [...PFX].map(([, pfx]) => pfx).map((pfx) => ({ id: pfx.id, pfx }));

        const rules = [...flags, ...sfxRules, ...pfxRules];
        rules.forEach((rule, idx) => {
            const found = this.mapToRuleIdx.get(rule.id);
            if (found) {
                const filename = this.filename;
                logError('Duplicate affix rule: %o, filename: %o', rule.id, filename);
                const toAdd = Array.isArray(found) ? found : [found];
                toAdd.push(idx);
                this.mapToRuleIdx.set(rule.id, toAdd);
                return;
            }
            this.mapToRuleIdx.set(rule.id, idx);
        });
        AF.forEach((af, idx) => {
            if (!af) return;
            const indexes = this.#getRuleIndexes(af);
            this.mapWordRulesToRuleIndexes.set(idx.toString(), indexes);
        });
        this.rules = rules.map((rule, idx) => this.#mapPartialRule(rule, idx));
    }

    #mapPartialRule(rule: PartialRule, index: number): AffRule {
        const { id, flags, sfx, pfx } = rule;
        const idx = this.mapToRuleIdx.get(id);
        // if (index !== idx) {
        //     const filename = this.affInfo.filename;
        //     logError('Unexpected index: %o !== %o, rule %o, filename: %o', index, idx, rule, filename);
        // }
        assert(idx !== undefined && (idx === index || (Array.isArray(idx) && idx.includes(index))));
        const fx = sfx || pfx;
        if (fx) {
            const affFx = this.#mapFx(fx);
            if (affFx.type === 'P') {
                return { id, idx: index, type: 'P', flags: 0, fx: affFx };
            } else {
                return { id, idx: index, type: 'S', flags: 0, fx: affFx };
            }
        }
        return { id, idx: index, type: 'F', flags: flags || 0 };
    }

    #mapFx(fx: Fx): AffFx {
        const { id, combinable } = fx;
        const substitutionsForRegExps = this.#mapSubstitutionsForRegExps(fx.substitutionsForRegExps);
        return { type: fx.type === 'PFX' ? 'P' : 'S', id, combinable, substitutionsForRegExps };
    }

    #mapSubstitutionsForRegExps(substitutions: SubstitutionsForRegExp[]): AffSubstitutionsForRegExp[] {
        return substitutions.map((sub) => this.#mapSubstitutionsForRegExp(sub));
    }

    #mapSubstitutionsForRegExp(subForRegExp: SubstitutionsForRegExp): AffSubstitutionsForRegExp {
        const { match, substitutions: subs } = subForRegExp;
        const substitutions = subs.map((sub) => this.#mapSubstitution(sub));
        const substitutionsGroupedByRemove = groupByField(substitutions, 'replace');
        return { match, substitutionsGroupedByRemove };
    }

    #mapSubstitution(sub: Substitution): AffSubstitution {
        const { type, remove, attach, attachRules, replace } = sub;
        const rules = attachRules ? this.getRuleIndexes(attachRules) : undefined;
        return { type, remove, attach, attachRules: rules, replace };
    }
}

function joinRules(a: AffRule[] | undefined, b: AffRule[] | undefined): AffRule[] | undefined {
    if (!a) return b;
    if (!b) return a;
    return [...a, ...b];
}

interface PartialRule {
    id: string;
    flags?: AffixFlags;
    sfx?: Fx;
    pfx?: Fx;
}

type AffType = 'P' | 'S';

interface AffFx {
    type: AffType;
    id: string;
    combinable: boolean;
    substitutionsForRegExps: AffSubstitutionsForRegExp[];
}

interface AffSubstitution {
    type: AffType;
    remove: string;
    attach: string;
    attachRules?: RuleIdx[];
    replace: RegExp;
}

interface AffSubstitutionsForRegExp {
    match: RegExp;
    substitutionsGroupedByRemove: Map<RegExp, AffSubstitution[]>;
}

type AffRule = FlagRule | FxRule;
type FxRule = PfxRule | SfxRule;
type RuleType = 'S' | 'P' | 'F';

interface RuleBase {
    id: string;
    idx: number;
    type: RuleType;
    flags: AffixFlags;
    px?: AffFx;
}

interface FlagRule extends RuleBase {
    type: 'F';
    flags: AffixFlags;
}

interface PfxRule extends RuleBase {
    type: 'P';
    fx: AffFx;
}

interface SfxRule extends RuleBase {
    type: 'S';
    fx: AffFx;
}

type KeyValuePair<T> = [keyof T, T[keyof T]];

function objectToKvP<T extends object>(t: T): KeyValuePair<T>[] {
    return Object.entries(t) as KeyValuePair<T>[];
}

// type Defined<T> = Exclude<T, undefined>;

function isValidFlagMember<T extends AffTransformFlags>(t: KeyValuePair<T>): t is KeyValuePair<Required<T>> {
    const [key, value] = t;
    return key in affFlag && !!value;
}

type AffFlagType = 'long' | 'num' | 'char';

/**
 *
 * @param FLAG - the FLAG value from the aff file
 * @returns the AffFlagType or throws
 */
export function toAffFlagType(FLAG: string | undefined): AffFlagType {
    if (!FLAG) return 'char';
    switch (FLAG) {
        case 'long':
        case 'num':
            return FLAG;
        default:
            throw new Error(`Unexpected FLAG value: ${FLAG}`);
    }
}
