import { onClearCache } from '../events/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArrayAny = Array<any>;

type MapArray = WeakMap<ArrayAny, ArrayAny>;
type MapMapArray = WeakMap<ArrayAny, MapArray>;

let cacheMergeListUnique: MapMapArray = new WeakMap();
let cacheMergeLists: MapMapArray = new WeakMap();

onClearCache(() => {
    cacheMergeListUnique = new WeakMap();
    cacheMergeLists = new WeakMap();
});

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
    return getValue(cacheMergeListUnique, left, right, (left, right) => [...new Set([...left, ...right])]);
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
    return getValue(cacheMergeLists, left, right, (left, right) => left.concat(right));
}

function getValue(
    map: MapMapArray,
    left: ArrayAny,
    right: ArrayAny,
    calc: (left: ArrayAny, right: ArrayAny) => ArrayAny,
): ArrayAny {
    const m = getMap(map, left);
    let v = m.get(right);
    if (!v) {
        v = calc(left, right);
        m.set(right, v);
    }
    return v;
}

function getMap(map: MapMapArray, key: ArrayAny): MapArray {
    let m = map.get(key);
    if (!m) {
        m = new Map();
        map.set(key, m);
    }
    return m;
}
