import type { PartialWithUndefined } from '../types';

/**
 * Creates a new object of type T based upon the field values from `value`.
 * n[k] = value[k] ?? default[k] where k must be a field in default.
 * Note: it will remove fields not in defaultValue!
 * @param value
 * @param defaultValue
 */

export function mergeDefaults<T extends object>(value: PartialWithUndefined<T> | undefined, defaultValue: T): T {
    const result = { ...defaultValue };
    if (value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [k, v] of Object.entries(value) as [keyof T, any][]) {
            if (k in result) {
                result[k] = v ?? result[k];
            }
        }
    }
    return result;
}
