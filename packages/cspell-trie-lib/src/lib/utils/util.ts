export function isDefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}

export function clean<T>(t: Partial<T>): Partial<T> {
    const r: Partial<T> = {};
    for (const k of Object.keys(t) as (keyof T)[]) {
        if (t[k] !== undefined) {
            r[k] = t[k];
        }
    }
    return r;
}

export function unique<T>(a: Iterable<T>): T[] {
    return [...new Set(a)];
}
