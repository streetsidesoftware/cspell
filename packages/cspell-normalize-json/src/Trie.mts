export class Trie<T> {
    root: RootNode<T> = { d: undefined, c: new Map() };

    add(key: string, data: T): void {
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
    }

    find(key: string): { data: T | undefined; found: string } | undefined {
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
        return { data: node.d, found };
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
