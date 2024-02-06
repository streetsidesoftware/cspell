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
    private _cacheCombinableRules = new WeakMap<FxRule[], WeakRef<FxRule[]>>();

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
    dictEntryToSuffixTree(line: string, root?: SuffixTree, maxDepth?: number): SuffixTree {
        const entry = this.affData.dictLineToEntry(line);
        const results = this.affixWordToSuffixTreeRoot(entry, root || createRoot(), maxDepth);
        return results;
    }

    affixWordToSuffixTreeRoot(entry: DictionaryEntry, root: SuffixTree, maxDepth?: number): SuffixTree {
        const affix = this.affData.dictEntryToApplyAffix(entry);
        const trace = this.#addSuffixToTraceNode(createTrace(root), affix);

        this.#suffixTreeApplyAffixRules(trace, maxDepth ?? this.maxSuffixDepth);
        return root;
    }

    #calcCombinableSfxRules(rules: FxRule[]): FxRule[] {
        const found = this._cacheCombinableRules.get(rules)?.deref();
        if (found) return found;
        const combinable = rules.filter((r) => r.fx.combinable && r.type === 'S');
        this._cacheCombinableRules.set(rules, new WeakRef(combinable));
        return combinable;
    }

    /**
     * @param trace - the sum of the traces.fix should be equal to affix.word.
     * @param affix - the affix with rules to apply
     * @param remainingDepth - the remaining depth to apply the rules.
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
            return this.#addPrefixToTraceNode(trace, {
                fix: sub.attach,
                flags: flags | toApply.flags,
                remove: toRemove,
                rules: joinRules(combinableSfx, toApply.rules),
            });
        };
        const subSuffix = (sub: AffSubstitution, toRemove: number) => {
            const toApply = this.affData.getRulesToApplyForAffSubstitution(sub);
            return this.#addSuffixToTraceNode(trace, {
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

    /**
     * Note: there is room to add an optimization the adds a suffix chain instead of a single suffix.
     * This would allow for common prefixes to be shared.
     * @param trace - current trace node
     * @param pfx - the prefix
     * @returns the trace node
     */
    #addPrefixToTraceNode(trace: SuffixTreeTraceNode, pfx: ApplyAffix): SuffixTreeTraceNode {
        const root = trace.createSiblingRoot();
        const pfxTrace = this.#addSuffixToTraceNode(root, { fix: pfx.fix, flags: AffixFlags.isNeedAffix, remove: 0 });
        return this.#addSuffixToTraceNode(pfxTrace, {
            fix: trace.word.slice(pfx.remove),
            flags: pfx.flags,
            remove: 0,
            rules: pfx.rules,
        });
    }

    #addSuffixToTraceNode(trace: SuffixTreeTraceNode, sfx: ApplyAffix): SuffixTreeTraceNode {
        const original = trace;
        let toRemove = sfx.remove;
        while (toRemove > trace.fix.length) {
            toRemove -= trace.fix.length;
            assert(trace.p);
            trace = trace.p;
        }
        if (toRemove > 0) {
            assert(trace.p);
            trace = this.#addSuffixToTraceNode(trace.p, {
                fix: trace.fix.slice(0, -toRemove),
                flags: AffixFlags.isNeedAffix,
                remove: 0,
            });
        }

        const childTrace = this.#attachSuffixToTrace(trace, sfx);
        if (original !== trace) {
            original.rebase();
        }
        return childTrace;
    }

    /**
     *
     * @param tree - the tree to add the suffix to
     * @param sfx - the suffix to add
     * @returns the nested tree for the suffix
     */
    #attachSuffixToTrace(trace: SuffixTreeTraceNode, sfx: ApplyAffix): SuffixTreeTraceNode {
        return trace.attachSuffix(sfx);
    }
}

function calcSuffixKey(sfx: Suffix): string {
    return `${sfx.fix}/${sfx.flags}`;
}

export interface SuffixTreeNode {
    readonly fix: string;
    readonly flags: AffixFlags;
    readonly c?: SuffixCollection | undefined;
}

interface SuffixBranch extends SuffixTreeNode {
    readonly c: SuffixCollection;
}

interface SuffixLeaf extends SuffixTreeNode {
    readonly c?: undefined;
}

// function isLeaf(node: SuffixTree): node is SuffixLeaf {
//     return !node.c;
// }

function isBranch(node: SuffixTreeNode): node is SuffixBranch {
    return !!node.c;
}

interface SuffixCollection {
    readonly [key: string]: SuffixTreeNode;
}

export function createRoot(): SuffixTree {
    return new SuffixTree();
}

function createTrace(root: SuffixTree): SuffixTreeTraceNode {
    return root.createTrace().createNode();
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

export function serializedSuffixTree(tree: SuffixTree): SerializedSuffixTree {
    const entries: SerializedSuffixTreeNode[] = [];
    const cacheKeys = new LRUCache<string, number>(10000);
    const cacheNodes = new LRUCache<SuffixTreeNode, number>(1000);
    const rootNodes = Object.values(tree.getRoot().c).map(serializeNode);
    return { rootNodes, nodes: entries };

    function calcKey(node: SerializedSuffixTreeNode): string {
        return `${node.x}/${node.f}/${node.c?.sort().join(',') || ''}`;
    }

    function lookupNode(node: SerializedSuffixTreeNode): number {
        const key = calcKey(node);
        return cacheKeys.get(key, () => entries.push(node) - 1);
    }

    function serializeNode(node: SuffixTreeNode): number {
        if (!node.c) {
            // Leaf Node
            // Check cache, otherwise add to cache.
            return cacheNodes.get(node, () => lookupNode({ x: node.fix, f: node.flags }));
        }
        return cacheNodes.get(node, () =>
            lookupNode({ x: node.fix, f: node.flags, c: node.c && Object.values(node.c).map(serializeNode) }),
        );
    }
}

export function* serializedSuffixTreeWords(tree: SerializedSuffixTree, sep = ''): Generator<string> {
    const nodes = tree.nodes;
    const rootNodes = tree.rootNodes;
    for (const node of rootNodes) {
        yield* serializedNodeWords('', nodes[node], nodes, sep);
    }
}

function* serializedNodeWords(
    prefix: string,
    node: SerializedSuffixTreeNode,
    nodes: SerializedSuffixTreeNode[],
    sep: string,
): Generator<string> {
    const word = prefix + node.x;
    if (!(node.f & AffixFlags.isNeedAffix)) {
        yield word;
    }
    if (!node.c) {
        return;
    }
    for (const child of node.c) {
        yield* serializedNodeWords(word + sep, nodes[child], nodes, sep);
    }
}

export function serializeSuffixTree(tree: SuffixTree, indent?: number | string): string {
    return JSON.stringify(serializedSuffixTree(tree), null, indent);
}

export class SuffixTree {
    private _version: number = 0;
    private _root: SuffixBranch = SuffixTree.createRootBranch();
    private _cacheAddToTree = new WeakMap<SuffixTreeNode, WeakMap<SuffixTreeNode, WeakRef<SuffixBranch>>>();
    private _cacheSuffixLeaves = new LRUCache<string, SuffixLeaf>(10000);

    createTrace(): SuffixTreeTrace {
        return new SuffixTreeTrace(this);
    }
    getRoot(): SuffixBranch {
        return this._root;
    }

    get version(): number {
        return this._version;
    }

    private static createRootBranch(children?: SuffixCollection): SuffixBranch {
        const c = children || Object.create(null);
        return Object.freeze({ fix: '', flags: AffixFlags.isNeedAffix, c });
    }

    modifyBranch(node: SuffixTreeNode, branch: SuffixTreeNode): SuffixBranch {
        const cached = this.#getCachedModifyBranch(node, branch);
        if (cached) return cached;
        const newNode = addBranchToTree(node, branch);
        this.#setCachedModifyBranch(node, branch, newNode);
        if (node === this._root) {
            this._root = newNode;
        }
        return newNode;
    }

    /**
     * Add flags to a node.
     * @param node - the node to add flags to
     * @param flags - the flags to add
     * @returns a new node if the flags were changed, otherwise the same node.
     */
    applyFlagsToNode<T extends SuffixTreeNode>(node: T, flags: AffixFlags): T {
        const f = (node.flags | flags) & (~AffixFlags.isNeedAffix | (node.flags & flags));
        const newNode = f === node.flags ? node : Object.freeze({ ...node, flags: f });
        if (node === this._root) {
            this._root = newNode as SuffixBranch;
        }
        return newNode;
    }

    #getCachedModifyBranch(node: SuffixTreeNode, branch: SuffixTreeNode): SuffixBranch | undefined {
        return this._cacheAddToTree.get(node)?.get(branch)?.deref();
    }

    #setCachedModifyBranch(node: SuffixTreeNode, branch: SuffixTreeNode, result: SuffixBranch) {
        let cache = this._cacheAddToTree.get(node);
        if (!cache) {
            cache = new WeakMap();
            this._cacheAddToTree.set(node, cache);
        }
        cache.set(branch, new WeakRef(result));
    }

    /**
     * Convert a suffix into a leaf.
     * @param sfx
     * @returns
     */
    suffixToLeaf(sfx: Suffix): SuffixLeaf {
        const key = calcSuffixKey(sfx);
        const found = this._cacheSuffixLeaves.get(key);
        if (found) return found;
        const leaf: SuffixLeaf = { fix: sfx.fix, flags: sfx.flags };
        Object.freeze(leaf);
        this._cacheSuffixLeaves.set(key, leaf);
        return leaf;
    }
}

class SuffixTreeTrace {
    constructor(readonly root: SuffixTree) {}
    createNode(): SuffixTreeTraceNode {
        return new SuffixTreeTraceNode(this.root, '', '', this.root.getRoot(), undefined, undefined);
    }
}

class SuffixTreeTraceNode {
    /** Reference a sibling trace that will need to be rebased. */
    private _sibling: SuffixTreeTraceNode | undefined;
    /** related tree node. */
    private _node: SuffixTreeNode;

    constructor(
        private root: SuffixTree,
        /** the current word at this point in the trace */
        readonly word: string,
        /** the suffix added to the parent to get to this point. */
        readonly fix: string,
        /** related tree node. */
        node: SuffixTreeNode,
        /** parent node */
        readonly p: SuffixTreeTraceNode | undefined,
        /** the rules to be applied. */
        readonly rules: FxRule[] | undefined,
    ) {
        this._node = node;
    }

    get node() {
        return this._node;
    }

    createSibling(rules: FxRule[] | undefined): SuffixTreeTraceNode {
        const t = new SuffixTreeTraceNode(this.root, this.word, this.fix, this.node, this.p, rules);
        t._sibling = this;
        return t;
    }

    createChildTrace(sfx: ApplyAffix): SuffixTreeTraceNode {
        const node = this._node.c?.[sfx.fix];
        assert(node);
        const t = new SuffixTreeTraceNode(this.root, this.word + sfx.fix, sfx.fix, node, this, sfx.rules);
        return t;
    }

    createSiblingRoot() {
        const sib = new SuffixTreeTraceNode(this.root, '', '', this.root.getRoot(), undefined, undefined);
        sib._sibling = this;
        return sib;
    }

    /**
     * Rebase the trace path to use the correct tree nodes.
     * This is needed because the tree is immutable and the nodes are shared.
     * If a node is modified, the path to the node needs to be updated.
     */
    rebase() {
        if (this.p) {
            this.p.rebase();
        }
        const node = this.p?.node.c?.[this.fix] || this.root.getRoot();
        assert(node);
        this._node = node;
        if (this._sibling) {
            this._sibling.rebase();
        }
    }

    attachSuffix(leaf: ApplyAffix): SuffixTreeTraceNode {
        if (!leaf.fix) {
            const node = this.root.applyFlagsToNode(this._node, leaf.flags);
            if (this._node !== node) {
                this._node = node;
                this.p && this.p.#modifyBranch(node);
                this.rebase();
            }
            return this.createSibling(leaf.rules);
        }

        const child = this._node.c?.[leaf.fix];
        if (child) {
            const cTrace = this.createChildTrace(leaf);
            return cTrace.attachSuffix({ ...leaf, fix: '' });
        }
        this.modifyBranch(this.root.suffixToLeaf(leaf));
        return this.createChildTrace(leaf);
    }

    /**
     * Add / change a branch to the tree.
     * @param branch - the branch to change.
     * @returns true if the tree was changed.
     */
    modifyBranch(branch: SuffixTreeNode): boolean {
        const changed = this.#modifyBranch(branch);
        changed && this.rebase();
        return changed;
    }

    #modifyBranch(branch: SuffixTreeNode): boolean {
        const node = branch.fix
            ? this.root.modifyBranch(this._node, branch)
            : this.root.applyFlagsToNode(this._node, branch.flags);
        if (node === this._node) return false;
        this._node = node;
        if (this.p) {
            this.p.#modifyBranch(node);
        }
        return true;
    }
}

function addBranchToTree(node: SuffixTreeNode, branch: SuffixTreeNode): SuffixBranch {
    assert(branch.fix);
    if (isBranch(node) && node.c[branch.fix] === branch) return node;
    const c = Object.create(null);
    Object.assign(c, node.c);
    c[branch.fix] = branch;
    return Object.freeze({ fix: node.fix, flags: node.flags, c });
}
