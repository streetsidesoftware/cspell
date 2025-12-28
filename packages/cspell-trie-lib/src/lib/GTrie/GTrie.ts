export class GTrieNode<K, V> {
    children: Map<K, GTrieNode<K, V>> | undefined;
    value: V | undefined;

    constructor(value?: V, children?: Map<K, GTrieNode<K, V>>) {
        this.value = value;
        this.children = children;
    }
}

/**
 * ### Generic Tries
 *
 * This is a Trie class that can contain any data. It is used in optimizing the dictionary and storing lookup data.
 * The performance is "good enough" for most uses, but may need to be optimized for large data sets.
 *
 * K - Key type
 * V - Value type
 */
export class GTrie<K, V> {
    root: GTrieNode<K, V>;

    constructor() {
        this.root = new GTrieNode<K, V>();
    }

    /**
     *
     * @param keys - the path to the child node
     * @param value - the value to set / insert
     * @return the previous value if one existed
     */
    insert(keys: Iterable<K>, value: V): V | undefined {
        const node = this.insertNode(keys);
        const prev = node.value;
        node.value = value;
        return prev;
    }

    /**
     * Insert nodes for the given keys into the trie.
     * Existing nodes are reused.
     * @param keys
     * @returns the final node inserted or found
     */
    insertNode(keys: Iterable<K>): GTrieNode<K, V> {
        let currentNode = this.root;
        for (const key of keys) {
            let children = currentNode.children;
            if (!children) {
                children = new Map<K, GTrieNode<K, V>>();
                currentNode.children = children;
            }
            let child = children.get(key);
            if (!child) {
                child = new GTrieNode<K, V>();
                children.set(key, child);
            }
            currentNode = child;
        }
        return currentNode;
    }

    findNode(keys: Iterable<K>): GTrieNode<K, V> | undefined {
        let currentNode = this.root;
        for (const key of keys) {
            const children = currentNode.children;
            if (!children) {
                return undefined;
            }
            const child = children.get(key);
            if (!child) {
                return undefined;
            }
            currentNode = child;
        }

        return currentNode;
    }

    has(keys: Iterable<K>): boolean {
        return this.findNode(keys)?.value !== undefined;
    }

    hasNode(keys: Iterable<K>): boolean {
        return this.findNode(keys) !== undefined;
    }

    get(keys: Iterable<K>): V | undefined {
        const node = this.findNode(keys);
        return node ? node.value : undefined;
    }

    static fromEntries<K, V>(entries: Iterable<[Iterable<K>, V]>): GTrie<K, V> {
        const trie = new GTrie<K, V>();
        for (const [keys, value] of entries) {
            trie.insert(keys, value);
        }
        return trie;
    }
}
