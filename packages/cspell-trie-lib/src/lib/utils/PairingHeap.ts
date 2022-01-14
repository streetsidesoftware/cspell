export interface PairHeapNode<T> {
    /** Value */
    v: T;
    /** Siblings */
    s: PairHeapNode<T> | undefined;
    /** Children */
    c: PairHeapNode<T> | undefined;
}

/**
 * Compare Functions
 * Compares two values a and b.
 * Meaning of return value:
 * `v <= 0`: `a` is ahead of `b`
 * `v > 0`: `b` is ahead of `a`
 * @param a - item a
 * @param b - item b
 * @returns a number
 */
export type CompareFn<T> = (a: T, b: T) => number;

export class PairingHeap<T> implements IterableIterator<T> {
    private _heap: PairHeapNode<T> | undefined;
    private _size = 0;

    constructor(readonly compare: CompareFn<T>) {}

    add(v: T): this {
        this._heap = insert(this.compare, this._heap, v);
        ++this._size;
        return this;
    }

    dequeue(): T | undefined {
        const n = this.next();
        if (n.done) return undefined;
        return n.value;
    }

    concat(i: Iterable<T>): this {
        for (const v of i) {
            this.add(v);
        }
        return this;
    }

    next(): IteratorResult<T> {
        if (!this._heap) {
            return { value: undefined, done: true };
        }
        const value = this._heap.v;
        --this._size;
        this._heap = removeHead(this.compare, this._heap);
        return { value };
    }

    peek(): T | undefined {
        return this._heap?.v;
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    get length(): number {
        return this._size;
    }
}

function removeHead<T>(compare: CompareFn<T>, heap: PairHeapNode<T> | undefined): PairHeapNode<T> | undefined {
    if (!heap || !heap.c) return undefined;
    return mergeSiblings(compare, heap.c);
}

function insert<T>(compare: CompareFn<T>, heap: PairHeapNode<T> | undefined, v: T): PairHeapNode<T> {
    const n: PairHeapNode<T> = {
        v,
        s: undefined,
        c: undefined,
    };

    if (!heap || compare(v, heap.v) <= 0) {
        n.c = heap;
        return n;
    }

    n.s = heap.c;
    heap.c = n;
    return heap;
}

function merge<T>(compare: CompareFn<T>, a: PairHeapNode<T>, b: PairHeapNode<T>): PairHeapNode<T> {
    if (compare(a.v, b.v) <= 0) {
        a.s = undefined;
        b.s = a.c;
        a.c = b;
        return a;
    }
    b.s = undefined;
    a.s = b.c;
    b.c = a;
    return b;
}

function mergeSiblings<T>(compare: CompareFn<T>, n: PairHeapNode<T>): PairHeapNode<T> {
    if (!n.s) return n;
    const s = n.s;
    const ss = s.s;
    const m = merge(compare, n, s);
    return ss ? merge(compare, m, mergeSiblings(compare, ss)) : m;
}

export const heapMethods = {
    insert,
    merge,
    mergeSiblings,
};
