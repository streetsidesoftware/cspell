import type { Stats } from '../models/Stats';

/**
 * Compare two Stats to see if they have the same value.
 * @param left - Stats
 * @param right - Stats
 * @returns 0 - equal; 1 - left > right; -1 left < right
 */
export function compareStats(left: Stats, right: Stats): number {
    if (left === right) return 0;
    if (left.eTag || right.eTag) return left.eTag === right.eTag ? 0 : (left.eTag || '') < (right.eTag || '') ? -1 : 1;
    const diff = left.size - right.size || left.mtimeMs - right.mtimeMs;
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}
