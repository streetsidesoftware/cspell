export class SimpleWeakCache<K extends object, T> {
    private L0 = new WeakMap<K, T>();
    private L1 = new WeakMap<K, T>();
    private L2 = new WeakMap<K, T>();
    private sizeL0 = 0;

    constructor(readonly size: number) {}

    has(key: K): boolean {
        for (const c of this.caches()) {
            if (c.has(key)) return true;
        }
        return false;
    }

    get(key: K): T | undefined {
        for (const c of this.caches()) {
            if (c.has(key)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const v = c.get(key)!;
                if (c !== this.L0) {
                    this.set(key, v);
                }
                return v;
            }
        }
        return undefined;
    }

    set(key: K, value: T) {
        if (this.L0.has(key)) {
            this.L0.set(key, value);
            return this;
        }

        if (this.sizeL0 >= this.size) {
            this.rotate();
        }

        this.sizeL0 += 1;
        this.L0.set(key, value);
    }

    private caches() {
        return [this.L0, this.L1, this.L2];
    }

    private rotate() {
        this.L2 = this.L1;
        this.L1 = this.L0;
        this.L0 = new WeakMap<K, T>();
        this.sizeL0 = 0;
    }
}

export class AutoWeakCache<K extends object, T> extends SimpleWeakCache<K, T> {
    constructor(readonly factory: (key: K) => T, size: number) {
        super(size);
    }

    get(key: K): T {
        const v = super.get(key);
        if (v !== undefined) return v;

        const val = this.factory(key);
        this.set(key, val);
        return val;
    }
}

/**
 * This will cache between `size` and 3 x `size` items.
 * It has three stashes, L0, L1, and L2. Each can contain `size` items.
 * When L0 is full, its items are given to L1 and L1's are given to L2, and L2 is empties.
 *
 * The stashes are searched in order, L0...L2. If an item is found in L1, or L2, it is
 * promoted to L0.
 */
export class SimpleCache<K, T> {
    private L0 = new Map<K, T>();
    private L1 = new Map<K, T>();
    private L2 = new Map<K, T>();

    constructor(readonly size: number) {}

    has(key: K): boolean {
        for (const c of this.caches()) {
            if (c.has(key)) return true;
        }
        return false;
    }

    get(key: K): T | undefined {
        for (const c of this.caches()) {
            if (c.has(key)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const v = c.get(key)!;
                if (c !== this.L0) {
                    this.set(key, v);
                }
                return v;
            }
        }
        return undefined;
    }

    set(key: K, value: T) {
        if (this.L0.has(key)) {
            this.L0.set(key, value);
            return this;
        }

        if (this.L0.size >= this.size) {
            this.rotate();
        }

        this.L0.set(key, value);
    }

    private caches() {
        return [this.L0, this.L1, this.L2];
    }

    private rotate() {
        this.L2.clear();
        this.L2 = this.L1;
        this.L1 = this.L0;
        this.L0 = new Map<K, T>();
    }
}

export class AutoCache<K, T> extends SimpleCache<K, T> {
    constructor(readonly factory: (key: K) => T, size: number) {
        super(size);
    }

    get(key: K): T {
        const v = super.get(key);
        if (v !== undefined) return v;

        const val = this.factory(key);
        this.set(key, val);
        return val;
    }
}
