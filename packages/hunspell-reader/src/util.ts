export function hrTimeToSeconds([seconds, nanoseconds]: number[]): number {
    return seconds + nanoseconds / 1_000_000_000;
}

export function uniqueFilter<T>(historySize: number): (i: T) => boolean;
export function uniqueFilter<T, K>(historySize: number, key: (t: T) => K): (i: T) => boolean;
export function uniqueFilter<T>(historySize: number, key: (t: T) => T = (a: T) => a): (i: T) => boolean {
    const f0 = new Set<T>();
    const f1 = new Set<T>();
    const found = [f0, f1, f0];
    let g = 0;
    return (t: T) => {
        const w = key(t);
        const p = found[g];
        if (p.has(w)) return false;
        const s = found[g + 1];
        const r = !s.has(w);
        p.add(w);
        if (p.size >= historySize) {
            s.clear();
            g = (g + 1) % 2;
        }
        return r;
    };
}

export function* batch<T>(i: Iterable<T>, size: number): Iterable<T[]> {
    let data: T[] = [];
    for (const t of i) {
        data.push(t);
        if (data.length === size) {
            yield data;
            data = [];
        }
    }

    if (data.length) {
        yield data;
    }
}

/**
 * Generate a filter function that will remove adjacent values that compare to falsy;
 * @param compare function to evaluate if two values are considered the same.
 */
export function filterOrderedList<T>(compare: (a: T, b: T) => boolean | number): (t: T) => boolean {
    let last: T | undefined;
    return (t: T): boolean => {
        const r = last === undefined ? last !== t : !!compare(last, t);
        last = r ? t : last;
        return r;
    };
}

export function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

/**
 * Remove all `undefined` values from an Object.
 * @param obj
 * @returns the same object.
 */
export function cleanObject<T>(obj: T): T {
    if (typeof obj != 'object') return obj;
    const r = obj as Record<string, unknown>;
    for (const [k, v] of Object.entries(r)) {
        if (v === undefined) {
            delete r[k];
        }
    }
    return obj;
}

export function groupByField<T, K extends keyof T>(i: Iterable<T>, field: K): Map<T[K], T[]> {
    const r = new Map<T[K], T[]>();
    for (const t of i) {
        const k = t[field];
        let a = r.get(k);
        if (!a) {
            a = [];
            r.set(k, a);
        }
        a.push(t);
    }
    return r;
}

export function insertItemIntoGroupByField<T, K extends keyof T>(map: Map<T[K], T[]>, field: K, item: T): void {
    const k = item[field];
    let a = map.get(k);
    if (!a) {
        a = [];
        map.set(k, a);
    }
    a.push(item);
}
