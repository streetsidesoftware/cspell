function swap<T>(t: T[], i: number, j: number) {
    const a = t[i];
    t[i] = t[j];
    t[j] = a;
}

function addToHeap<T>(t: T[], c: T, compare: (a: T, b: T) => number): void {
    t.push(c);

    let b = t.length - 1;
    let a = (b - 1) >> 1;
    while (b > 0 && compare(t[a], t[b]) >= 0) {
        swap(t, a, b);
        b = a;
        a = (b - 1) >> 1;
    }
}

function takeFromHeap<T>(t: T[], compare: (a: T, b: T) => number): T | undefined {
    const result = t[0];
    if (t.length <= 1) {
        t.length = 0;
        return result;
    }
    t[0] = t[t.length - 1];
    t.length -= 1;
    const m = t.length - 1;
    let i = 0;
    let j = i * 2 + 1;
    while (j < m) {
        const a = j;
        const b = j + 1;
        const k = compare(t[a], t[b]) < 0 ? a : b;
        if (compare(t[i], t[k]) <= 0) {
            break;
        }
        swap(t, i, k);
        i = k;
        j = i * 2 + 1;
    }
    if (j === m) {
        if (compare(t[i], t[j]) > 0) {
            swap(t, i, j);
        }
    }
    return result;
}

/**
 * MinHeapQueue - based upon a minHeap array.
 */
export class MinHeapQueue<T> implements IterableIterator<T> {
    private values: T[] = [];
    constructor(readonly compare: (a: T, b: T) => number) {}

    add(t: T): MinHeapQueue<T> {
        addToHeap(this.values, t, this.compare);
        return this;
    }

    get length(): number {
        return this.values.length;
    }

    dequeue(): T | undefined {
        return takeFromHeap(this.values, this.compare);
    }

    append(i: Iterable<T>): MinHeapQueue<T> {
        for (const v of i) {
            this.add(v);
        }
        return this;
    }

    next(): IteratorResult<T> {
        const value = this.dequeue();
        return value !== undefined
            ? {
                  value,
              }
            : {
                  value,
                  done: true,
              };
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    clone(): MinHeapQueue<T> {
        const clone = new MinHeapQueue(this.compare);
        clone.values = this.values.concat();
        return clone;
    }
}

export const __testing__ = {
    addToHeap,
    takeFromHeap,
};
