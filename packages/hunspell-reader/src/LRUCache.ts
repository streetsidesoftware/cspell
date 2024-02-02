interface CacheEntry<K, V> {
    k: K;
    v: V;
    p?: CacheEntry<K, V>;
    n?: CacheEntry<K, V>;
}

export class LRUCache<K, V> {
    private cache: Map<K, CacheEntry<K, V>> = new Map();
    private head?: CacheEntry<K, V>;
    private tail?: CacheEntry<K, V>;

    constructor(readonly maxSize: number) {}

    get(key: K): V | undefined;
    get(key: K, resolve: (k: K) => V): V;
    get(key: K, resolve?: (k: K) => V): V | undefined;
    get(key: K, resolve?: (k: K) => V): V | undefined {
        const value = this.cache.get(key);
        if (value) {
            this.promote(value);
            return value.v;
        }
        if (resolve) {
            const v = resolve(key);
            this.set(key, v);
            return v;
        }
        return undefined;
    }

    set(key: K, value: V) {
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.dropTail();
        }
        const entry = { k: key, v: value };
        this.cache.set(key, entry);
        this.promote(entry);
    }

    get size() {
        return this.cache.size;
    }

    private dropTail() {
        if (this.tail) {
            this.cache.delete(this.tail.k);
            this.tail = this.tail.p;
        }
        if (this.tail) {
            this.tail.n = undefined;
        }
    }

    private promote(entry: CacheEntry<K, V>) {
        if (entry === this.head) return;
        if (entry === this.tail) {
            this.tail = entry.p;
        }
        if (entry.p) {
            entry.p.n = entry.n;
        }
        if (entry.n) {
            entry.n.p = entry.p;
        }
        entry.p = undefined;
        entry.n = this.head;
        this.head = entry;
    }
}
