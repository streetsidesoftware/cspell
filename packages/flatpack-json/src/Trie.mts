export class Trie<T> {
    root: RootNode<T> = { d: undefined, c: new Map() };

    add(key: string | Iterable<string>, data: T): TrieNode<T> {
        let node: TrieNode<T> = this.root;
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
        const { node, found } = foundNode;
        return { data: node.d, found };
    }

    findNode(key: string | Iterable<string>): FoundNode<T> | undefined {
        let node: TrieNode<T> = this.root;
        let found = '';
        for (const k of key) {
            const c = node.c;
            if (!c) {
                break;
            }
            const n = c.get(k);
            if (!n) {
                break;
            }
            found += k;
            node = n;
        }

        return { node, found };
    }

    *walk(prefix = ''): Iterable<FoundNode<T>> {
        const found = this.findNode(prefix);
        if (found?.found !== prefix) return;
        yield* walkTrie(found.node, found.found);
    }
}

export function* walkTrie<T>(node: TrieNode<T>, prefix = ''): Iterable<FoundNode<T>> {
    yield { node, found: prefix };
    if (node.c) {
        for (const [k, n] of node.c) {
            yield* walkTrie(n, prefix + k);
        }
    }
}

type ChildMap<T> = Map<string, TrieNode<T>>;
interface TrieNode<T> {
    d?: T | undefined;
    c?: ChildMap<T>;
}
interface RootNode<T> extends TrieNode<T> {
    d: undefined;
}

interface FoundNode<T> {
    node: TrieNode<T>;
    found: string;
}
