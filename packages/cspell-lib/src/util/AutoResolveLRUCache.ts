import assert from 'assert';

import { isArrayEqual } from './util';

interface LLNode<T> {
    value: T;
    n?: LLNode<T> | undefined;
    p?: LLNode<T> | undefined;
}
interface LL<T> {
    n?: LLNode<T> | undefined;
    p?: LLNode<T> | undefined;
}

export class AutoResolveLRUCache<T, V> {
    protected list: LL<{ p: T; r: V }> = {};
    private count = 0;
    private _misses = 0;
    private _hits = 0;
    private _added = 0;
    private _removed = 0;

    constructor(readonly maxSize: number, readonly isEqual: (a: T, b: T) => boolean) {
        assert(maxSize > 0);
    }

    get(params: T): V | undefined;
    get(params: T, fn: (p: T) => V): V;
    get(params: T, fn?: (p: T) => V): V | undefined;
    get(params: T, fn?: (p: T) => V): V | undefined {
        const isEqual = this.isEqual;
        for (let n = this.list.n; n; n = n.n) {
            if (isEqual(n.value.p, params)) {
                this.addToHead(n);
                ++this._hits;
                return n.value.r;
            }
        }
        ++this._misses;
        if (!fn) return undefined;
        const value = {
            p: params,
            r: fn(params),
        };
        this.addToHead({ value, n: undefined, p: undefined });
        return value.r;
    }

    get size() {
        return this.count;
    }

    get hits() {
        return this._hits;
    }

    get misses() {
        return this._misses;
    }

    get added() {
        return this._added;
    }

    get removed() {
        return this._removed;
    }

    clear() {
        this._added = 0;
        this._hits = 0;
        this._misses = 0;
        this._removed = 0;
        this.list.n = undefined;
        this.list.p = undefined;
        this.count = 0;
    }

    private addToHead(n: LLNode<{ p: T; r: V }>) {
        if (!this.list.n) {
            this.list.n = n;
            this.list.p = n;
            n.n = undefined;
            n.p = undefined;
            this.count = 1;
            this._added = 1;
            return;
        }
        if (this.list.n === n) return;
        if (this.list.p === n) {
            this.list.p = n.p;
        }
        const isNew = !n.n && !n.p;
        n.p && (n.p.n = n.n);
        n.n && (n.n.p = n.p);
        n.p = undefined;
        n.n = this.list.n;
        n.n && (n.n.p = n);
        this.list.n = n;
        const add = (isNew && 1) || 0;
        this._added += add;
        this.count += add;
        if (this.count > this.maxSize) {
            const prev = this.list.p?.p;
            assert(prev);
            prev.n = undefined;
            this.list.p = prev;
            ++this._removed;
            --this.count;
        }
    }

    stats() {
        return { size: this.count, hits: this.hits, misses: this.misses, added: this.added, removed: this.removed };
    }

    toJSON() {
        return this.stats();
    }

    static assertValid<T, V>(cache: AutoResolveLRUCache<T, V>): void {
        assertValidateLL(cache.list);
    }
}

export function assertValidateLL<T>(list: LL<T>): void {
    if (!list.n && !list.p) return;
    assert(list.n, 'Bad Next');
    assert(list.p, 'Bad Prev');

    const visited = new Set<LL<T>>();
    // validate forwards
    let n = list;
    for (; n.n; n = n.n) {
        assert(!visited.has(n.n), 'Circular');
        visited.add(n.n);
    }
    assert(list.p === n, 'Tail matches');

    visited.clear();
    // validate backwards
    n = list;
    for (; n.p; n = n.p) {
        assert(!visited.has(n.p), 'Circular');
        visited.add(n.p);
    }
    assert(list.n === n, 'Head matches');
}

export class AutoResolveLastNCalls<Params extends unknown[], Result> extends AutoResolveLRUCache<Params, Result> {
    constructor(maxSize: number) {
        super(maxSize, isArrayEqual);
    }
}
