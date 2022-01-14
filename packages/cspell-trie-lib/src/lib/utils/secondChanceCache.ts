export class SecondChanceCache<Key, Value> {
    private map0: Map<Key, Value>;
    private map1: Map<Key, Value>;

    constructor(readonly maxL0Size: number) {
        this.map0 = new Map<Key, Value>();
        this.map1 = new Map<Key, Value>();
    }

    public has(key: Key) {
        if (this.map0.has(key)) return true;
        if (this.map1.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.set(key, this.get1(key)!);
            return true;
        }
        return false;
    }

    public get(key: Key): Value | undefined {
        return this.map0.get(key) ?? this.get1(key);
    }

    public set(key: Key, value: Value): this {
        if (this.map0.size >= this.maxL0Size && !this.map0.has(key)) {
            this.map1 = this.map0;
            this.map0 = new Map<Key, Value>();
        }
        this.map0.set(key, value);
        return this;
    }

    public get size(): number {
        return this.map0.size + this.map1.size;
    }

    public get size0(): number {
        return this.map0.size;
    }

    public get size1(): number {
        return this.map1.size;
    }

    public clear(): this {
        this.map0.clear();
        this.map1.clear();
        return this;
    }

    private get1(key: Key): Value | undefined {
        if (this.map1.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const v = this.map1.get(key)!;
            this.map1.delete(key);
            this.set(key, v);
            return v;
        }
        return undefined;
    }

    public toArray(): [Key, Value][] {
        return [...this.map1, ...this.map0];
    }
}
