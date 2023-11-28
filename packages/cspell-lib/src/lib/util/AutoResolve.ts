interface IDisposable {
    dispose(): void;
}

export function autoResolve<K, V>(map: Map<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export class AutoResolveCache<K, V> implements IDisposable {
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

    delete(k: K): boolean {
        return this.map.delete(k);
    }

    clear(): void {
        this.map.clear();
    }

    dispose(): void {
        this.clear();
    }
}

export function createAutoResolveCache<K, V>(): AutoResolveCache<K, V> {
    return new AutoResolveCache();
}

export interface IWeakMap<K extends object, V> {
    get(k: K): V | undefined;
    set(k: K, v: V): this;
    has(k: K): boolean;
    delete(key: K): boolean;
}

export function autoResolveWeak<K extends object, V>(map: IWeakMap<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export class AutoResolveWeakCache<K extends object, V> implements IWeakMap<K, V> {
    private _map = new WeakMap<K, V>();

    get(k: K): V | undefined;
    get(k: K, resolve: (k: K) => V): V;
    get(k: K, resolve?: (k: K) => V): V | undefined;
    get(k: K, resolve?: (k: K) => V): V | undefined {
        return resolve ? autoResolveWeak(this._map, k, resolve) : this._map.get(k);
    }

    get map() {
        return this._map;
    }

    has(k: K): boolean {
        return this._map.has(k);
    }

    set(k: K, v: V): this {
        this._map.set(k, v);
        return this;
    }

    clear(): void {
        this._map = new WeakMap();
    }

    delete(k: K): boolean {
        return this._map.delete(k);
    }

    dispose(): void {
        this.clear();
    }
}

export function createAutoResolveWeakCache<K extends object, V>(): AutoResolveWeakCache<K, V> {
    return new AutoResolveWeakCache();
}
