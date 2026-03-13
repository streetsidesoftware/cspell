/**
 * A cache that can store values for both primitive and object keys. Primitive keys are stored in a Map,
 * while object keys are stored in a WeakMap. This allows the cache to automatically clean up entries for
 * objects that are no longer referenced elsewhere in the program, while still allowing primitive keys to
 * be stored without issue.
 */
export class WeakCache<V> {
    #primitiveCache = new Map<unknown, V>();
    #objectCache = new WeakMap<object, V>();

    constructor(entries?: Iterable<readonly [unknown, V]>) {
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    get(key: unknown): V | undefined {
        if (typeof key === 'object' && key !== null) {
            return this.#objectCache.get(key);
        }
        return this.#primitiveCache.get(key);
    }

    set(key: unknown, value: V): void {
        if (typeof key === 'object' && key !== null) {
            this.#objectCache.set(key, value);
        } else {
            this.#primitiveCache.set(key, value);
        }
    }

    clear(): void {
        this.#primitiveCache.clear();
        this.#objectCache = new WeakMap();
    }

    has(key: unknown): boolean {
        // Note: WeakMap.has will always return false for primitive keys,
        // so we can check both caches without first checking if it is an object.
        return this.#primitiveCache.has(key) || this.#objectCache.has(key as object);
    }
}
