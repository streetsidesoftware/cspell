export function groupBy<T, K extends keyof T>(data: Readonly<T[]>, key: K): Map<T[K], T[]>;
export function groupBy<T, K>(data: Readonly<T[]>, fn: (d: Readonly<T>) => K): Map<K, T[]>;
export function groupBy<T, K>(data: Readonly<T[]>, key: keyof T | ((d: T) => K)): Map<K, T[]> {
    const fn = typeof key === 'function' ? key : (d: T) => d[key] as K;
    const map = new Map<K, T[]>();
    for (const d of data) {
        const k = fn(d);
        const group = map.get(k) || [];
        group.push(d);
        map.set(k, group);
    }
    return map;
}
