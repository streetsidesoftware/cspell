import assert from 'assert';

import { DefaultMaxDepth } from './affConstants.js';
import type { AffSubstitution, ApplyAffix, FxRule, Suffix } from './AffData.js';
import { AffData, joinRules } from './AffData.js';
import type { AffInfo, DictionaryEntry } from './affDef.js';
import { AffixFlags } from './AffixFlags.js';
import { Converter } from './converter.js';
import { LRUCache } from './LRUCache.js';

export class AffSuffixTreeCompiler {
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

    get iConv() {
        return this._iConv;
    }

    get oConv() {
        return this._oConv;
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

export interface SuffixTreeTraceNode {
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

export function createTrace(root: SuffixRoot): SuffixTreeTraceNode {
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

export function addSuffixToTraceNode(trace: SuffixTreeTraceNode, sfx: ApplyAffix): SuffixTreeTraceNode {
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

export function addPrefixToTraceNode(trace: SuffixTreeTraceNode, pfx: ApplyAffix): SuffixTreeTraceNode {
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
