import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import type { TrieInfo } from '../ITrieNode/TrieInfo.js';
import type { TrieNode, TrieRoot } from './TrieNode.js';

export function trieRootToITrieRoot(root: TrieRoot): ITrieNodeRoot {
    return ImplITrieRoot.toITrieNode(root);
}

export function trieNodeToITrieNode(node: TrieNode): ITrieNode {
    return ImplITrieNode.toITrieNode(node);
}

const EmptyKeys: readonly string[] = Object.freeze([]);
const EmptyValues: readonly ITrieNode[] = Object.freeze([]);
const EmptyEntries: readonly (readonly [string, ITrieNode])[] = Object.freeze([]);

class ImplITrieNode implements ITrieNode {
    readonly id: TrieNode;
    private _keys: readonly string[] | undefined;
    protected constructor(readonly node: TrieNode) {
        this.id = node;
    }

    /** flag End of Word */
    get eow(): boolean {
        return !!this.node.f;
    }

    /** number of children */
    get size(): number {
        if (!this.node.c) return 0;
        return this.keys().length;
    }

    /** get keys to children */
    keys(): readonly string[] {
        if (this._keys) return this._keys;
        const keys = this.node.c ? Object.keys(this.node.c) : EmptyKeys;
        this._keys = keys;
        return keys;
    }

    /** get the child nodes */
    values(): readonly ITrieNode[] {
        return !this.node.c ? EmptyValues : Object.values(this.node.c).map((n) => ImplITrieNode.toITrieNode(n));
    }

    entries(): readonly (readonly [string, ITrieNode])[] {
        return !this.node.c
            ? EmptyEntries
            : Object.entries(this.node.c).map(([k, n]) => [k, ImplITrieNode.toITrieNode(n)]);
    }

    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined {
        const n = this.node.c?.[char];
        if (!n) return undefined;
        return ImplITrieNode.toITrieNode(n);
    }

    has(char: string): boolean {
        const c = this.node.c;
        return (c && char in c) || false;
    }

    child(keyIdx: number): ITrieNode {
        const char = this.keys()[keyIdx];
        const n = char && this.get(char);
        if (!n) throw new Error('Index out of range.');
        return n;
    }

    hasChildren(): boolean {
        return !!this.node.c;
    }

    static toITrieNode(node: TrieNode): ITrieNode {
        return new this(node);
    }
}

class ImplITrieRoot extends ImplITrieNode implements ITrieNodeRoot {
    readonly info: Readonly<TrieInfo>;

    protected constructor(readonly root: TrieRoot) {
        super(root);
        const { stripCaseAndAccentsPrefix, compoundCharacter, forbiddenWordPrefix, isCaseAware } = root;
        this.info = { stripCaseAndAccentsPrefix, compoundCharacter, forbiddenWordPrefix, isCaseAware };
    }

    get eow(): boolean {
        return false;
    }

    resolveId(id: ITrieNodeId): ITrieNode {
        const n = id as TrieNode;
        return new ImplITrieNode(n);
    }

    static toITrieNode(node: TrieRoot): ITrieNodeRoot {
        return new this(node);
    }
}
