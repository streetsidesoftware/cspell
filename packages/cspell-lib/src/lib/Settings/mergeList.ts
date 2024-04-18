import { CalcLeftRightResultWeakCache } from './mergeCache.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArrayAny = Array<any>;

const cacheMergeListUnique = new CalcLeftRightResultWeakCache<ArrayAny, ArrayAny, ArrayAny>();
const cacheMergeLists = new CalcLeftRightResultWeakCache<ArrayAny, ArrayAny, ArrayAny>();

/**
 * Merges two lists and removes duplicates.  Order is NOT preserved.
 */
export function mergeListUnique(left: undefined, right: undefined): undefined;
export function mergeListUnique<T>(left: T[], right: T[]): T[];
export function mergeListUnique<T>(left: undefined, right: T[]): T[];
export function mergeListUnique<T>(left: T[], right: undefined): T[];
export function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
export function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (!Array.isArray(left)) return Array.isArray(right) ? right : undefined;
    if (!Array.isArray(right)) return left;
    if (!right.length) return left;
    if (!left.length) return right;
    const result = cacheMergeListUnique.get(left, right, (left, right) => [...new Set([...left, ...right])]);
    Object.freeze(left);
    Object.freeze(right);
    Object.freeze(result);
    return result;
}

/**
 * Merges two lists.
 * Order is preserved.
 */
export function mergeList(left: undefined, right: undefined): undefined;
export function mergeList<T>(left: T[], right: T[]): T[];
export function mergeList<T>(left: undefined, right: T[]): T[];
export function mergeList<T>(left: T[], right: undefined): T[];
export function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
export function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (!Array.isArray(left)) return Array.isArray(right) ? right : undefined;
    if (!Array.isArray(right)) return left;
    if (!left.length) return right;
    if (!right.length) return left;
    const result = cacheMergeLists.get(left, right, (left, right) => [...left, ...right]);
    Object.freeze(left);
    Object.freeze(right);
    Object.freeze(result);
    return result;
}

export function stats() {
    return {
        cacheMergeListUnique: cacheMergeListUnique.stats(),
        cacheMergeLists: cacheMergeLists.stats(),
    };
}
