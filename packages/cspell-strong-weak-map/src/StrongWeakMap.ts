export class StrongWeakMap<K, V extends object> implements Map<K, V> {
    private map: Map<K, WeakRef<V>>;

    constructor(init?: [K, V][]) {
        this.map = new Map(init?.map(([k, v]) => [k, new WeakRef(v)]));
    }

    clear(): void {
        this.map.clear();
    }
    /**
     * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
     */
    delete(key: K): boolean {
        return this.map.delete(key);
    }

    /**
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     */
    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thisArg?: any,
    ): void {
        if (thisArg) {
            callbackfn = callbackfn.bind(thisArg);
        }
        for (const [key, value] of this) {
            callbackfn(value, key, this);
        }
    }
    /**
     * Returns a specified element from the Map object. You will get a reference to the value object and any change made to that
     * object will effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key.
     *   If no element is associated with the specified key, undefined is returned.
     */
    get(key: K): V | undefined {
        const ref = this.map.get(key);
        if (!ref) return undefined;
        const value = ref.deref();
        if (!value) {
            this.map.delete(key);
            return undefined;
        }
        return value;
    }

    /**
     * Returns a specified element from the Map. If the element isn't found, the resolver function is called and the result is stored in the map and returned.
     */
    autoGet(key: K, resolver: (key: K) => V): V {
        const found = this.get(key);
        if (found) return found;

        const created = resolver(key);
        this.set(key, created);
        return created;
    }

    /**
     * Note: has will cause the value object to live longer.
     * See: [WeakRef - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef#notes_on_weakrefs)
     * @returns boolean indicating whether an element with the specified key exists or not.
     */
    has(key: K): boolean {
        const value = this.get(key);
        return !!value;
    }
    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     */
    set(key: K, value: V): this {
        this.map.set(key, new WeakRef(value));
        return this;
    }
    /**
     * @returns the number of elements in the Map. Note: it is possible that some of the values have been dereferenced
     */
    get size(): number {
        return this.map.size;
    }

    /** Returns an iterable of entries in the map. */
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    *entries(): IterableIterator<[K, V]> {
        for (const key of this.map.keys()) {
            const value = this.get(key);
            if (!value) continue;
            yield [key, value];
        }
    }

    /**
     * Returns an iterable of keys in the map
     *
     * Note: It is possible that the value associated with the key was released.
     */
    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    /**
     * Returns an iterable of values in the map
     */
    *values(): IterableIterator<V> {
        for (const [_, value] of this) {
            yield value;
        }
    }

    /**
     * Removes any keys that reference released objects.
     */
    cleanKeys(): this {
        const keysToDel: K[] = [];
        for (const [key, ref] of this.map.entries()) {
            if (!ref.deref()) {
                keysToDel.push(key);
            }
        }
        for (const key of keysToDel) {
            this.map.delete(key);
        }
        return this;
    }

    readonly [Symbol.toStringTag]: string = 'StrongWeakMap';
}
