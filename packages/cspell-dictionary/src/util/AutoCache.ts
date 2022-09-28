const CACHE_SIZE = 2000;

interface AutoCache<R> extends CacheStats {
    (word: string): R;
}

export interface CacheStats {
    hits: number;
    misses: number;
    swaps: number;
}

class Cache01<R> implements CacheStats {
    private count = 0;
    private cache0: Record<string, R> = Object.create(null);
    private cache1: Record<string, R> = Object.create(null);

    hits = 0;
    misses = 0;
    swaps = 0;

    constructor(readonly maxSize = CACHE_SIZE) {}

    get(key: string): R | undefined {
        const cache0 = this.cache0;
        const cache1 = this.cache1;
        if (key in cache0) {
            ++this.hits;
            return cache0[key];
        }
        if (key in cache1) {
            ++this.hits;
            ++this.count;
            const r = cache1[key];
            cache0[key] = r;
            return r;
        }
        ++this.misses;
        return undefined;
    }

    set(key: string, value: R): this {
        if (this.count >= this.maxSize) {
            this.cache1 = this.cache0;
            this.cache1 = Object.create(null);
            this.swaps++;
            this.count = 0;
        }
        ++this.count;
        this.cache0[key] = value;
        return this;
    }
}

export function createCache01<R>(size?: number): Cache01<R> {
    return new Cache01(size);
}

export function autoCache<R>(fn: (p: string) => R): AutoCache<R> {
    const cache = createCache01<R>();

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
export function extractStats(ac: AutoCache<unknown>): CacheStats {
    const { hits, misses, swaps } = ac;
    return { hits, misses, swaps };
}
