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
import { Converter } from './converter.js';
import { LRUCache } from './LRUCache.js';
import { filterOrderedList, groupByField, isDefined } from './util.js';

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
    protected _cacheCombinableRules = new WeakMap<FxRule[], FxRule[]>();

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

    // cspell:ignore COMPOUNDMIN

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
        const combinableSfx = this.#calcCombinableSfxRules(rules);
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

    /**
     * Takes a line from a hunspell.dic file and applies the rules found in the aff file.
     * For performance reasons, only the `word` field is mapped with OCONV.
     * @param {string} line - the line from the .dic file.
     */
    dictEntryToSuffixTree(line: string, root?: SuffixRoot, maxDepth?: number): SuffixRoot {
        const entry = this.affData.dictLineToEntry(line);
        const results = this.affixWordToSuffixTreeRoot(entry, root || createRoot(), maxDepth);
        return results;
    }

    affixWordToSuffixTreeRoot(entry: DictionaryEntry, root: SuffixRoot, maxDepth?: number): SuffixRoot {
        const affix = this.affData.dictEntryToApplyAffix(entry);
        const trace = addSuffixToTraceNode(createTrace(root), affix);

        this.#suffixTreeApplyAffixRules(trace, maxDepth ?? this.maxSuffixDepth);
        return root;
    }

    #calcCombinableSfxRules(rules: FxRule[]): FxRule[] {
        const found = this._cacheCombinableRules.get(rules);
        if (found) return found;
        const combinable = rules.filter((r) => r.fx.combinable && r.type === 'S');
        this._cacheCombinableRules.set(rules, combinable);
        return combinable;
    }

    /**
     * @param trace - the sum of the traces.fix should be equal to affix.word.
     * @param affix - the affix with rules to apply
     * @param remainingDepth - the remaining depth to apply the rules.
     * @returns the current node
     */
    #suffixTreeApplyAffixRules(trace: SuffixTreeTraceNode, remainingDepth: number) {
        if (remainingDepth <= 0 || !trace.rules?.length) {
            // Nothing to do.
            return;
        }
        for (const rule of trace.rules) {
            this.#suffixTreeApplyAffixRule(trace, rule, remainingDepth);
        }
    }

    #suffixTreeApplyAffixRule(trace: SuffixTreeTraceNode, rule: FxRule, remainingDepth: number) {
        if (remainingDepth <= 0) {
            // Nothing to do.
            return;
        }

        const { word } = trace;
        const flags = trace.node.flags & ~AffixFlags.isNeedAffix;
        const combinableSfx = rule.type === 'P' && trace.rules ? this.#calcCombinableSfxRules(trace.rules) : undefined;

        const subPrefix = (sub: AffSubstitution, toRemove: number) => {
            const toApply = this.affData.getRulesToApplyForAffSubstitution(sub);
            return addPrefixToTraceNode(trace, {
                fix: sub.attach,
                flags: flags | toApply.flags,
                remove: toRemove,
                rules: joinRules(combinableSfx, toApply.rules),
            });
        };
        const subSuffix = (sub: AffSubstitution, toRemove: number) => {
            const toApply = this.affData.getRulesToApplyForAffSubstitution(sub);
            return addSuffixToTraceNode(trace, {
                fix: sub.attach,
                flags: flags | toApply.flags,
                remove: toRemove,
                rules: toApply.rules,
            });
        };
        const subFn = rule.type === 'P' ? subPrefix : subSuffix;

        const matchingSubstitutions = rule.fx.substitutionsForRegExps.filter((sub) => sub.match.test(word));
        for (const subs of matchingSubstitutions) {
            for (const [replace, substitutions] of subs.substitutionsGroupedByRemove) {
                if (!replace.test(word)) continue;
                const stripped = word.replace(replace, '');
                const removedCount = word.length - stripped.length;
                for (const sub of substitutions) {
                    const subTrace = subFn(sub, removedCount);
                    this.#suffixTreeApplyAffixRules(subTrace, remainingDepth - 1);
                }
            }
        }
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

class AffData {
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

type WeakArrayCache<T> = WeakMap<Array<T>, WeakMap<Array<T>, Array<T>>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheJoin: WeakArrayCache<any> = new WeakMap();

function joinRules<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
    if (!a) return b;
    if (!b) return a;
    let cache = cacheJoin.get(a);
    if (!cache) {
        cache = new WeakMap();
        cacheJoin.set(a, cache);
    }
    let result = cache.get(b);
    if (result) return result;
    result = [...new Set([...a, ...b])];
    cache.set(b, result);
    return result;
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
    wordFlags: string;
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

interface RulesToApply {
    /** Calculated Flags */
    flags: AffixFlags;
    /** Rules applied to generate the flags */
    applied: RuleIdx[];
    /** FX Rules to be applied. */
    rules: FxRule[];
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

enum AffFlagType {
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
}

interface Suffix {
    fix: string;
    flags: AffixFlags;
}

interface ApplyAffix extends Suffix {
    /** rules to be applied later */
    rules?: FxRule[] | undefined;
    remove: number;
}

export interface SuffixTree extends Suffix {
    c?: SuffixCollection;
}

export interface SuffixRoot extends SuffixTree {
    fix: '';
    c: SuffixCollection;
}

interface SuffixCollection {
    [key: string]: SuffixTree;
}

interface SuffixTreeTraceNode {
    /** the current word at this point in the trace */
    word: string;
    /** the rules to be applied. */
    rules: FxRule[] | undefined;
    /** the suffix added to the parent to get to this point. */
    fix: string;
    /** related tree node. */
    node: SuffixTree;
    /** parent node */
    p: SuffixTreeTraceNode | undefined;
}

export function createRoot(): SuffixRoot {
    const root: SuffixRoot = { fix: '', flags: AffixFlags.isNeedAffix, c: Object.create(null) };
    return root;
}

function createTrace(root: SuffixRoot): SuffixTreeTraceNode {
    return { word: '', fix: '', node: root, p: undefined, rules: undefined };
}

/**
 *
 * @param tree - the tree to add the suffix to
 * @param sfx - the suffix to add
 * @returns the nested tree for the suffix
 */
function addSuffixToNode(tree: SuffixTree, sfx: Suffix): SuffixTree {
    const c: SuffixCollection = tree.c || Object.create(null);
    tree.c = c;
    const found = sfx.fix ? c[sfx.fix] : tree;
    if (!found) {
        const node: SuffixTree = { fix: sfx.fix, flags: sfx.flags };
        c[sfx.fix] = node;
        return node;
    }
    // Flags can be ORed together except for the isNeedAffix flag.
    found.flags = (found.flags | sfx.flags) & (~AffixFlags.isNeedAffix | (found.flags & sfx.flags));
    return found;
}

function addSuffixToTraceNode(trace: SuffixTreeTraceNode, sfx: ApplyAffix): SuffixTreeTraceNode {
    let toRemove = sfx.remove;
    while (toRemove > trace.fix.length) {
        toRemove -= trace.fix.length;
        assert(trace.p);
        trace = trace.p;
    }
    if (toRemove > 0) {
        assert(trace.p);
        trace = addSuffixToTraceNode(trace.p, {
            fix: trace.fix.slice(0, -toRemove),
            flags: AffixFlags.isNeedAffix,
            remove: 0,
        });
    }

    const node = addSuffixToNode(trace.node, sfx);
    return { word: trace.word + sfx.fix, fix: sfx.fix, node, p: trace, rules: sfx.rules };
}

/**
 * Note: there is room to add an optimization the adds a suffix chain instead of a single suffix.
 * This would allow for common prefixes to be shared.
 * @param trace - current trace node
 * @param pfx - the prefix
 * @returns the trace node
 */
function addPrefixToTraceNode(trace: SuffixTreeTraceNode, pfx: ApplyAffix): SuffixTreeTraceNode {
    const root = getTraceRoot(trace);
    const pfxTrace = addSuffixToTraceNode(root, { fix: pfx.fix, flags: AffixFlags.isNeedAffix, remove: 0 });
    return addSuffixToTraceNode(pfxTrace, {
        fix: trace.word.slice(pfx.remove),
        flags: pfx.flags,
        remove: 0,
        rules: pfx.rules,
    });
}

function getTraceRoot(trace: SuffixTreeTraceNode): SuffixTreeTraceNode {
    let p = trace;
    while (p.p) {
        p = p.p;
    }
    return p;
}

interface SerializedSuffixTreeNode {
    x: string;
    f: AffixFlags;
    c?: number[];
}

interface SerializedSuffixTree {
    nodes: SerializedSuffixTreeNode[];
    rootNodes: number[];
}

export function serializedSuffixTree(tree: SuffixRoot): SerializedSuffixTree {
    const entries: SerializedSuffixTreeNode[] = [];
    const cacheKeys = new LRUCache<string, number>(10000);
    const cacheNodes = new LRUCache<SuffixTree, number>(1000);
    const rootNodes = Object.values(tree.c).map(serializeNode);
    return { rootNodes, nodes: entries };

    function calcKey(node: SerializedSuffixTreeNode): string {
        return `${node.x}/${node.f}/${node.c?.sort().join(',') || ''}`;
    }

    function lookupNode(node: SerializedSuffixTreeNode): number {
        const key = calcKey(node);
        return cacheKeys.get(key, () => entries.push(node) - 1);
    }

    function serializeNode(node: SuffixTree): number {
        if (!node.c) {
            // Leaf Node
            // Check cache, otherwise add to cache.

            return cacheNodes.get(node, () => lookupNode({ x: node.fix, f: node.flags }));
        }
        const c = Object.values(node.c).map(serializeNode);
        return cacheNodes.get(node, () => lookupNode({ x: node.fix, f: node.flags, c }));
    }
}

export function serializeSuffixTree(tree: SuffixRoot, indent?: number | string): string {
    return JSON.stringify(serializedSuffixTree(tree), null, indent);
}
