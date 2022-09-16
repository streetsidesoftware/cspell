import type { RemoveUndefined } from './types';
/**
 * Delete all `undefined` fields from an object.
 * @param src - object to be cleaned
 */
export function clean<T extends object>(src: T): RemoveUndefined<T> {
    const r = src;
    type keyOfT = keyof T;
    type keysOfT = keyOfT[];
    for (const key of Object.keys(r) as keysOfT) {
        if (r[key] === undefined) {
            delete r[key];
        }
    }
    return r as RemoveUndefined<T>;
}
