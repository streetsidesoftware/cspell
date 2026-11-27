import { StrongWeakMap as AutoResolveStrongWeakMap } from '@streetsidesoftware/auto-resolve-map';

/**
 * A Map with strong keys and weakly referenced values.
 *
 * It is the `StrongWeakMap` of `@streetsidesoftware/auto-resolve-map`, with two more methods.
 */
export class StrongWeakMap<K, V extends object> extends AutoResolveStrongWeakMap<K, V> {
    /**
     * Get the value for a key, or compute and store it when there is none or it was released.
     *
     * The same as `getOrInsertComputed`.
     *
     * @param key - the key to look up.
     * @param resolver - computes the value. It's called with the key, only when there is no value.
     */
    autoGet(key: K, resolver: (key: K) => V): V {
        return this.getOrInsertComputed(key, resolver);
    }

    /**
     * Remove the keys whose value was released.
     *
     * The map also removes them on its own, some time after the values are garbage collected.
     */
    cleanKeys(): this {
        for (const key of [...this.keys()]) {
            if (!this.has(key)) this.delete(key);
        }
        return this;
    }
}
