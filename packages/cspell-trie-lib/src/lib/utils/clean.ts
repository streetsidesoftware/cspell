import type { RemoveUndefined } from '../types';

export function clean<T extends object>(t: T): RemoveUndefined<T> {
    const copy = { ...t };
    for (const key of Object.keys(copy) as (keyof T)[]) {
        if (copy[key] === undefined) {
            delete copy[key];
        }
    }
    return copy as RemoveUndefined<T>;
}
