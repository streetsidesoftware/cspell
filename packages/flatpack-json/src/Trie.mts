/**
 * @deprecated This class is a bit wonky and will be removed in the future. Use {@link Trie} instead.
 */
export class TrieOfStrings<T> {
    root: RootNode<string, T> = { d: undefined, c: new Map() };

    /**
     * Add a string to the Trie.
     * The behavior is a bit wonky and will get deprecated in the future.
     * Wonky behavior:
     * - It adds the data element to every new node created.
     */
    add(key: string | Iterable<string>, data: T): TrieNode<string, T> {
        let node: TrieNode<string, T> = this.root;
        for (const k of key) {
            let c = node.c;
            if (!c) {
                node.c = c = new Map();
            }
            let n = c.get(k);
            if (!n) {
                c.set(k, (n = { d: data }));
            }
            node = n;
        }
        return node;
    }

    find(key: string | Iterable<string>): { data: T | undefined; found: string } | undefined {
        const foundNode = this.findNode(key);
        if (!foundNode) {
            return undefined;
        }
        const { node, path: found } = foundNode;
        return { data: node.d, found: found.join('') };
    }

    findNode(key: string | Iterable<string>): FoundNode<string, T> | undefined {
        let node: TrieNode<string, T> = this.root;
        const path: string[] = [];
        let found = true;
        for (const k of key) {
            const c = node.c;
            if (!c) {
                found = false;
                break;
            }
            const n = c.get(k);
            if (!n) {
                found = false;
                break;
            }
            path.push(k);
            node = n;
        }

        return { node, path, found };
    }
}

export class Trie<K, T> {
    root: TrieNode<K, T> = {};
    size: number = 0;

    set(key: Iterable<K>, data: T): TrieNode<K, T> {
        let added = 0;
        let node: TrieNode<K, T> = this.root;
        for (const k of key) {
            let c = node.c;
            if (!c) {
                node.c = c = new Map();
                added = 1;
            }
            let n = c.get(k);
            if (!n) {
                c.set(k, (n = {}));
                added = 1;
            }
            node = n;
        }
        node.d = data;
        this.size += added;
        return node;
    }

    get(key: Iterable<K>): T | undefined {
        const f = this.findNode(key);
        return f?.found ? f.node.d : undefined;
    }

    has(key: Iterable<K>): boolean {
        const f = this.findNode(key);
        return !!f?.found && Object.hasOwn(f.node, 'd');
    }

    delete(key: Iterable<K>): boolean {
        const f = this.findNode(key);
        if (!f?.found || !Object.hasOwn(f.node, 'd')) {
            return false;
        }
        delete f.node.d;
        --this.size;
        return true;
    }

    clear(): void {
        this.root = {};
        this.size = 0;
    }

    /**
     * Look for the longest prefix of the key that exists in the trie and return the node and the found prefix.
     * @param key - The key to search for.
     * @returns The node and path found. If the full key is not found, `found` will be false.
     */
    findNode(key: Iterable<K>): FoundNode<K, T> | undefined {
        let node: TrieNode<K, T> = this.root;
        const path: K[] = [];
        let found = true;
        for (const k of key) {
            const c = node.c;
            if (!c) {
                found = false;
                break;
            }
            const n = c.get(k);
            if (!n) {
                found = false;
                break;
            }
            path.push(k);
            node = n;
        }

        return { node, path, found };
    }
}

type ChildMap<K, T> = Map<K, TrieNode<K, T>>;
interface TrieNode<K, T> {
    d?: T | undefined;
    c?: ChildMap<K, T>;
}
interface RootNode<K, T> extends TrieNode<K, T> {
    d: undefined;
}

interface FoundNode<K, T> {
    node: TrieNode<K, T>;
    found: boolean;
    path: K[];
}
