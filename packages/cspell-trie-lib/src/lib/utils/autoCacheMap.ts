export class AutoCacheMap<T, U> extends Map<T, U> {
    constructor(readonly autoFn: (v: T) => U) {
        super();
    }

    get(v: T): U {
        const r = super.get(v);

        if (r !== undefined) return r;

        const u = this.autoFn(v);
        super.set(v, u);
        return u;
    }
}

export class AutoCacheWeakMap<T extends object, U> extends WeakMap<T, U> {
    constructor(readonly autoFn: (v: T) => U) {
        super();
    }

    get(v: T): U {
        const r = super.get(v);

        if (r !== undefined) return r;

        const u = this.autoFn(v);
        super.set(v, u);
        return u;
    }
}
