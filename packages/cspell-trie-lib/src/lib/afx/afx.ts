import { opFlatten, opMap, opUnique, pipe } from '@cspell/cspell-pipe/sync';

import { assert } from '../utils/assert.ts';
import type {
    AfxDef,
    AfxRule,
    AfxRuleId,
    AfxType,
    AfxWord,
    AfxWordAndRules,
    AppliedRuleResult,
    PfxMutation,
    PfxRule,
    PfxType,
    RuleDirective,
    SfxMutation,
    SfxRule,
    SfxType,
} from './afxTypes.ts';

const DEFAULT_MAX_DEPTH = 3;

export class Afx {
    #rules: Map<AfxRuleId, AfxRuleImpl>;
    #depth: number;
    #extractRules: ExtractRulesFn;

    constructor(afxDef: AfxDef) {
        this.#extractRules = createExtractRulesFromWordFn(afxDef.wordRulesFormat);
        this.#rules = createRuleMap(afxDef.rules);
        this.#depth = afxDef.maxDepth ?? DEFAULT_MAX_DEPTH;
    }

    words(entry: string): Iterable<string> {
        if (!entry.includes('/')) return [entry];
        return pipe(
            this.applyTo(entry),
            opMap((ar) => ar.word),
            opUnique(),
        );
    }

    *applyTo(word: string): Iterable<AfxWordAndRules> {
        const afw = this.#extractRules(word);
        yield* this.#applyRules(afw, this.#depth);
    }

    *#applyRules(afw: AfxWordAndRules, depth: number): Iterable<AfxWordAndRules> {
        yield afw;
        if (!depth || !afw.apply?.length) return;

        const rules = afw.apply.map((ruleId) => this.#rules.get(ruleId)).filter((r): r is AfxRuleImpl => !!r);

        const toApplyLater: AfxRuleId[] = rules.filter((r) => r.canCombineWith === 'S').map((r) => r.id);

        const applyRules = (word: string): Iterable<AfxWordAndRules> => {
            return this.#applyRules({ word, apply: toApplyLater }, depth - 1);
        };

        function* applyLater(iAfw: Iterable<AfxWordAndRules>): Iterable<AfxWordAndRules> {
            yield* iAfw;
            yield* applyRules(afw.word);
        }

        for (const rule of rules) {
            const results = rule.applyTo(afw);
            if (!results?.length) continue;
            const r = pipe(
                results,
                opMap((r) => this.#applyRules(r, depth - 1)),
                opFlatten(),
            );
            yield* rule.canCombineWith === 'P' ? applyLater(r) : r;
        }
    }
}

type ExtractRulesFn = (word: string) => AfxWordAndRules;

interface AfxRuleImpl {
    readonly id: AfxRuleId;
    readonly type: AfxType;
    readonly canCombineWith: AfxType | undefined;
    applyTo(word: AfxWord, postApply?: AfxRuleId[] | undefined): AppliedRuleResult[] | undefined;
}

export class AfxSuffixRule implements AfxRuleImpl {
    readonly id: AfxRuleId;
    readonly type: AfxType = 'S';
    readonly canCombineWith: PfxType | undefined;
    #mutations: SfxMutationImpl[];
    constructor(id: AfxRuleId, rule: SfxRule, mutations: SfxMutationImpl[]) {
        this.id = id;
        this.canCombineWith = rule.combinable ? 'P' : undefined;
        this.#mutations = mutations;
    }

    applyTo(afxWord: AfxWord): AppliedRuleResult[] | undefined {
        let results: AppliedRuleResult[] | undefined = undefined;
        const word = afxWord.word;

        for (const mutation of this.#mutations) {
            if (!mutation.when(word)) continue;

            const baseWord = mutation.length ? word.slice(0, -mutation.length) : word;
            const newWord = baseWord + mutation.attach;
            results ??= [];
            results.push({
                word: newWord,
                apply: mutation.apply,
            });
        }

        return results;
    }
}

export class AfxPrefixRule implements AfxRuleImpl {
    readonly id: AfxRuleId;
    readonly type: AfxType = 'P';
    readonly canCombineWith: SfxType | undefined;
    #mutations: PfxMutationImpl[];

    constructor(id: AfxRuleId, rule: PfxRule, mutations: PfxMutationImpl[]) {
        this.id = id;
        this.canCombineWith = rule.combinable ? 'S' : undefined;
        this.#mutations = mutations;
    }

    applyTo(afxWord: AfxWord): AppliedRuleResult[] | undefined {
        let results: AppliedRuleResult[] | undefined = undefined;
        const word = afxWord.word;

        for (const mutation of this.#mutations) {
            if (!mutation.when(word)) continue;

            const baseWord = mutation.length ? word.slice(mutation.length) : word;
            const newWord = mutation.attach + baseWord;
            results ??= [];
            results.push({
                word: newWord,
                apply: mutation.apply,
            });
        }

        return results;
    }
}

export function isSfxRule(rule: AfxRule | undefined): rule is SfxRule {
    return rule?.type === 'S';
}

export function isPfxRule(rule: AfxRule | undefined): rule is PfxRule {
    return rule?.type === 'P';
}

export function createRuleMap(rules: AfxDef['rules']): Map<AfxRuleId, AfxRuleImpl> {
    const map = new Map<AfxRuleId, AfxRuleImpl>();

    const entries = rules instanceof Map ? rules.entries() : Object.entries(rules);

    for (const [id, rule] of entries) {
        assert(!rule.id || id === rule.id, `Rule id mismatch: ${id} !== ${rule.id}`);
        assert(isPfxRule(rule) || isSfxRule(rule), `Unknown rule type: ${(rule as AfxRule).type}`);
        map.set(id, createAfxRule(id, rule));
    }

    return map;
}

export function createAfxRule(id: AfxRuleId, rule: PfxRule | SfxRule): AfxPrefixRule | AfxSuffixRule {
    return isPfxRule(rule) ? createAfxPrefixRule(id, rule) : createAfxSuffixRule(id, rule);
}

function createAfxPrefixRule(id: AfxRuleId, rule: PfxRule): AfxPrefixRule {
    const mutations = rule.mutations.map((m) => new PfxMutationImpl(id, m));
    return new AfxPrefixRule(id, rule, mutations);
}

function createAfxSuffixRule(id: AfxRuleId, rule: SfxRule): AfxSuffixRule {
    const mutations = rule.mutations.map((m) => new SfxMutationImpl(id, m));
    return new AfxSuffixRule(id, rule, mutations);
}

interface AfxMutationImpl {
    readonly remove: string;
    readonly attach: string;
    readonly length: number;
    readonly when: (word: string) => boolean;
    readonly apply?: AfxRuleId[] | undefined;
}

export class SfxMutationImpl implements AfxMutationImpl {
    readonly remove: string;
    readonly length: number;
    readonly attach: string;
    readonly apply?: AfxRuleId[] | undefined;
    #matchFn: (word: string) => boolean;

    constructor(id: AfxRuleId, mutation: SfxMutation) {
        const { remove, attach, when, apply } = mutation;
        this.remove = remove;
        this.length = this.remove.length;
        this.attach = attach;
        this.apply = apply?.length ? apply : undefined;
        this.#matchFn = makeMatchFunction(when, id, 'S');
    }

    when(word: string): boolean {
        return word.endsWith(this.remove) && this.#matchFn(word);
    }
}

export class PfxMutationImpl implements AfxMutationImpl {
    readonly remove: string;
    readonly length: number;
    readonly attach: string;
    readonly apply?: AfxRuleId[] | undefined;
    #matchFn: (word: string) => boolean;

    constructor(id: AfxRuleId, mutation: PfxMutation) {
        const { remove, attach, when, apply } = mutation;
        this.remove = remove;
        this.length = this.remove.length;
        this.attach = attach;
        this.apply = apply?.length ? apply : undefined;
        this.#matchFn = makeMatchFunction(when, id, 'P');
    }

    when(word: string): boolean {
        return word.startsWith(this.remove) && this.#matchFn(word);
    }
}

export function createExtractRulesFromWordFn(format: AfxDef['wordRulesFormat']): ExtractRulesFn {
    const split =
        format === ','
            ? (s: string) => s.split(',')
            : format === '..' // long rules
              ? (s: string) => [...s.matchAll(/../gu)].map((m) => m[0])
              : (s: string) => [...s];
    return (word: string): AfxWordAndRules => {
        const r: RuleDirective = '/';
        if (!word.includes(r)) return { word };
        const [w, ruleStr] = word.split(r, 2);
        return { word: w, apply: split(ruleStr.replace(/\s.*/, '')) };
    };
}

const forbiddenMatchRegex = /[/\\*+():|]/g;
const hasRegExp = /[[\].?]/;

export function makeMatchFunction(match: string, id: AfxRuleId, afxType: AfxType): (word: string) => boolean {
    if (!match || match === '.') return () => true;
    assert(forbiddenMatchRegex.test(match) === false, `Invalid characters in ${id} match string: ${match}`);
    match = afxType === 'P' ? match.replaceAll('^', '') : match.replace('$', '');
    if (!hasRegExp.test(match)) {
        const afx = match;
        return afxType === 'P' ? (word) => word.startsWith(afx) : (word) => word.endsWith(afx);
    }
    const regex = afxType === 'P' ? new RegExp(`^${match}`) : new RegExp(`${match}$`);
    return (word) => regex.test(word);
}
