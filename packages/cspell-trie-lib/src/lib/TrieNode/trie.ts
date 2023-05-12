import type { ITrieNode, ITrieNodeRoot } from './ITrieNode.js';
import type { TrieNode, TrieOptions, TrieRoot } from './TrieNode.js';

export function trieRootToITrieRoot(root: TrieRoot): ITrieNodeRoot {
    return new ImplITrieRoot(root);
}

export function trieNodeToITrieNode(root: TrieNode): ITrieNode {
    return new ImplITrieNode(root);
}

const EmptyKeys: readonly string[] = Object.freeze([]);

class ImplITrieNode implements ITrieNode {
    private keys: readonly string[] | undefined;
    constructor(readonly node: TrieNode) {}

    /** flag End of Word */
    get eow(): boolean {
        return !!this.node.f;
    }

    /** number of children */
    get size(): number {
        if (!this.node.c) return 0;
        return this.getKeys().length;
    }

    /** get keys to children */
    getKeys(): readonly string[] {
        if (this.keys) return this.keys;
        const keys = this.node.c ? Object.keys(this.node.c) : EmptyKeys;
        this.keys = keys;
        return keys;
    }

    /** get child ITrieNode */
    get(char: string): ITrieNode | undefined {
        const n = this.node.c?.[char];
        if (!n) return undefined;
        return new ImplITrieNode(n);
    }

    has(char: string): boolean {
        const c = this.node.c;
        return (c && char in c) || false;
    }

    child(keyIdx: number): ITrieNode | undefined {
        const char = this.getKeys()[keyIdx];
        if (!char) return undefined;
        return this.get(char);
    }
}

class ImplITrieRoot extends ImplITrieNode implements ITrieNodeRoot {
    readonly options: Readonly<TrieOptions>;

    constructor(readonly root: TrieRoot) {
        super(root);
        const { stripCaseAndAccentsPrefix, compoundCharacter, forbiddenWordPrefix } = root;
        this.options = { stripCaseAndAccentsPrefix, compoundCharacter, forbiddenWordPrefix };
    }

    get eow(): boolean {
        return false;
    }
}
