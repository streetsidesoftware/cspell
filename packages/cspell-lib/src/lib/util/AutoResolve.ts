export function autoResolve<K, V>(map: Map<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export class AutoResolveCache<K, V> {
    readonly map = new Map<K, V>();

    get(k: K): V | undefined;
    get(k: K, resolve: (k: K) => V): V;
    get(k: K, resolve?: (k: K) => V): V | undefined;
    get(k: K, resolve?: (k: K) => V): V | undefined {
        return resolve ? autoResolve(this.map, k, resolve) : this.map.get(k);
    }

    has(k: K): boolean {
        return this.map.has(k);
    }

    set(k: K, v: V): this {
        this.map.set(k, v);
        return this;
    }
}

export function createAutoResolveCache<K, V>(): AutoResolveCache<K, V> {
    return new AutoResolveCache();
}

export function autoResolveWeak<K extends object, V>(map: WeakMap<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export class AutoResolveWeakCache<K extends object, V> {
    readonly map = new WeakMap<K, V>();

    get(k: K): V | undefined;
    get(k: K, resolve: (k: K) => V): V;
    get(k: K, resolve?: (k: K) => V): V | undefined;
    get(k: K, resolve?: (k: K) => V): V | undefined {
        return resolve ? autoResolveWeak(this.map, k, resolve) : this.map.get(k);
    }

    has(k: K): boolean {
        return this.map.has(k);
    }

    set(k: K, v: V): this {
        this.map.set(k, v);
        return this;
    }
}

export function createAutoResolveWeakCache<K extends object, V>(): AutoResolveWeakCache<K, V> {
    return new AutoResolveWeakCache();
}
