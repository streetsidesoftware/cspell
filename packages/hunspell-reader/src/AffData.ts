import assert from 'assert';

import { affFlag } from './affConstants.js';
import type {
    AffInfo,
    AffTransformFlags,
    DictionaryEntry,
    DictionaryLine,
    Fx,
    RuleIdx,
    SingleFlag,
    Substitution,
    SubstitutionsForRegExp,
    WordFlags,
} from './affDef.js';
import { AffixFlags, toAffixFlags } from './AffixFlags.js';
import type { KeyValuePair } from './util.js';
import { groupByField, isDefined, objectToKvP } from './util.js';

const debug = false;

export function logError(msg: string, ...args: unknown[]) {
    debug && console.error(msg, ...args);
}

export class AffData {
    rules: AffRule[] = [];
    mapToRuleIdx: Map<SingleFlag, RuleIdx | RuleIdx[]> = new Map();
    mapWordRulesToRuleIndexes: Map<WordFlags, RuleIdx[]> = new Map();
    mapWordRulesToRules: Map<WordFlags, AffRule[]> = new Map();
    mapWordRulesToApply: Map<WordFlags, RulesToApply> = new Map();
    affFlagType: AffFlagType;
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

    getRulesToApply(wordFlags: WordFlags): RulesToApply {
        const found = this.mapWordRulesToApply.get(wordFlags);
        if (found) return found;
        const rules = this.getRules(wordFlags);
        const flags = this.rulesToFlags(rules);
        const applied = rules.filter((r) => r.type === 'F').map((r) => r.idx);
        return {
            flags,
            applied,
            rules: rules.filter((rule): rule is FxRule => rule.type !== 'F'),
        };
    }

    dictEntryToApplyAffix(entry: DictionaryEntry): ApplyAffix {
        const wordFlags = entry.flags;
        const { flags, rules } = this.getRulesToApply(wordFlags);
        return { fix: entry.word, flags, remove: 0, rules };
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

    getRulesToApplyForAffSubstitution(sub: AffSubstitution): RulesToApply {
        return this.getRulesToApply(sub.wordFlags);
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
            case AffFlagType.long:
                return [...new Set(rules.replace(/(..)/g, '$1//').split('//').slice(0, -1))];
            case AffFlagType.num:
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
        return { type, remove, attach, attachRules: rules, wordFlags: attachRules || '', replace };
    }
}
type AffType = 'P' | 'S';

export interface AffFx {
    type: AffType;
    id: string;
    combinable: boolean;
    substitutionsForRegExps: AffSubstitutionsForRegExp[];
}

export interface AffSubstitution {
    type: AffType;
    remove: string;
    attach: string;
    wordFlags: string;
    attachRules?: RuleIdx[];
    replace: RegExp;
}

export interface AffSubstitutionsForRegExp {
    match: RegExp;
    substitutionsGroupedByRemove: Map<RegExp, AffSubstitution[]>;
}

export type AffRule = FlagRule | FxRule;
export type FxRule = PfxRule | SfxRule;
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

export interface RulesToApply {
    /** Calculated Flags */
    flags: AffixFlags;
    /** Rules applied to generate the flags */
    applied: RuleIdx[];
    /** FX Rules to be applied. */
    rules: FxRule[];
}
export interface AffixWordSource {
    /** Original dictionary entry */
    dict: DictionaryEntry;
    /** Optional applied rules, trace mode must be turned on. */
    appliedRules?: number[] | undefined;
}
interface Affix {
    /** The word */
    word: string;
    /** Rules to apply */
    rules: FxRule[] | undefined;
    /** Flags */
    flags: AffixFlags;
}

export interface AffixWord extends AffixWordSource, Affix {}

export interface Suffix {
    readonly fix: string;
    readonly flags: AffixFlags;
}

export interface ApplyAffix extends Suffix {
    /** rules to be applied later */
    readonly rules?: FxRule[] | undefined;
    readonly remove: number;
}
export interface PartialRule {
    id: string;
    flags?: AffixFlags;
    sfx?: Fx;
    pfx?: Fx;
}
export enum AffFlagType {
    /** Flags are encoded as individual unicode characters */
    char = 0,
    /** Flags are encoded as two unicode characters */
    long = 1,
    /** Flags are encoded as comma separated numbers. */
    num = 2,
}
/**
 *
 * @param FLAG - the FLAG value from the aff file
 * @returns the AffFlagType or throws
 */

export function toAffFlagType(FLAG: string | undefined): AffFlagType {
    if (!FLAG) return AffFlagType.char;
    switch (FLAG) {
        case 'long':
            return AffFlagType.long;
        case 'num':
            return AffFlagType.num;
        default:
            throw new Error(`Unexpected FLAG value: ${FLAG}`);
    }
} // type Defined<T> = Exclude<T, undefined>;

export function isValidFlagMember<T extends AffTransformFlags>(t: KeyValuePair<T>): t is KeyValuePair<Required<T>> {
    const [key, value] = t;
    return key in affFlag && !!value;
} // eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheJoin: WeakArrayCache<any> = new WeakMap();

export function joinRules<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
    if (!a) return b;
    if (!b) return a;
    let cache = cacheJoin.get(a);
    if (!cache) {
        cache = new WeakMap();
        cacheJoin.set(a, cache);
    }
    let result = cache.get(b)?.deref();
    if (result) return result;
    result = [...new Set([...a, ...b])];
    cache.set(b, new WeakRef(result));
    return result;
}
export type WeakArrayCache<T> = WeakMap<Array<T>, WeakMap<Array<T>, WeakRef<Array<T>>>>;
