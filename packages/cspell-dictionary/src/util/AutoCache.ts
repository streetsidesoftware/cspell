const CACHE_SIZE = 100;

interface AutoCache<R> extends CacheStats {
    (word: string): R;
}

export interface CacheStats {
    hits: number;
    misses: number;
    swaps: number;
}

abstract class Cache01<R> implements CacheStats {
    hits = 0;
    misses = 0;
    swaps = 0;

    constructor(readonly maxSize: number) {}

    abstract get(key: string): R | undefined;
    abstract set(key: string, value: R): this;
}

class Cache01Map<R> extends Cache01<R> implements CacheStats {
    private count = 0;
    private cache0: Map<string, R> = new Map();
    private cache1: Map<string, R> = new Map();

    constructor(maxSize: number) {
        super(maxSize);
    }

    get(key: string): R | undefined {
        const cache0 = this.cache0;
        const cache1 = this.cache1;
        let found = cache0.get(key);
        if (found !== undefined) {
            ++this.hits;
            return found;
        }
        found = cache1.get(key);
        if (found !== undefined) {
            ++this.hits;
            ++this.count;
            cache0.set(key, found);
            return found;
        }
        ++this.misses;
        return undefined;
    }

    set(key: string, value: R): this {
        if (this.count >= this.maxSize) {
            const c = this.cache1;
            this.cache1 = this.cache0;
            this.cache0 = c;
            c.clear();
            this.swaps++;
            this.count = 0;
        }
        ++this.count;
        this.cache0.set(key, value);
        return this;
    }
}

export function createCache01<R>(size: number): Cache01<R> {
    return new Cache01Map(size);
}

export function autoCache<R>(fn: (p: string) => R, size = CACHE_SIZE): AutoCache<R> {
    const cache = createCache01<R>(size);

    const ac: AutoCache<R> = get as AutoCache<R>;
    ac.hits = 0;
    ac.misses = 0;
    ac.swaps = 0;

    function get(k: string): R {
        const f = cache.get(k);
        if (f !== undefined) {
            ++ac.hits;
            return f;
        }

        const r = fn(k);
        cache.set(k, r);
        ac.swaps = cache.swaps;
        ++ac.misses;
        return r;
    }

    return ac;
}

export function extractStats(ac: AutoCache<unknown> | CacheStats): CacheStats {
    const { hits, misses, swaps } = ac;
    return { hits, misses, swaps };
}
