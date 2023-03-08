/* eslint-disable @typescript-eslint/no-explicit-any */
const defaultSize = 50000;

/** Only types that can be easily turned into strings */
type P0 = string | number | boolean | RegExp | undefined;

type Primitive = P0 | P0[];

/**
 * Memorize the result of a function call to be returned on later calls with the same parameters.
 *
 * Note: The parameters are converted into a string: `key = args.join('>!@[')`
 *
 * For speed, it keeps two caches, L0 and L1. Each cache can contain up to `size` values. But that actual number
 * of cached values is between `size + 1` and `size * 2`.
 *
 * Caches are NOT sorted. Items are added to L0 until it is full. Once it is full, L1 takes over L0's values and L0 is cleared.
 *
 * If an item is not found in L0, L1 is checked before calling the `fn` and the resulting value store in L0.
 *
 * @param fn - function to be called.
 * @param size - size of cache
 */
export function memorizer<
    F extends (...args: Primitive[]) => any,
    Args extends Parameters<F> = Parameters<F>,
    R extends ReturnType<F> = ReturnType<F>
>(fn: F, size?: number): (...args: Args) => R {
    return memorizerKeyBy(fn, (...args: Args) => args.join('>!@['), size);
}

/**
 * Memorize the result of a function call to be returned on later calls with the same parameters.
 *
 * Note: `keyFn` is use to convert the function parameters into a string to look up in the cache.
 *
 * For speed, it keeps two caches, L0 and L1. Each cache can contain up to `size` values. But that actual number
 * of cached values is between `size + 1` and `size * 2`.
 *
 * Caches are NOT sorted. Items are added to L0 until it is full. Once it is full, L1 takes over L0's values and L0 is cleared.
 *
 * If an item is not found in L0, L1 is checked before calling the `fn` and the resulting value store in L0.
 *
 * @param fn - function to be memorized
 * @param keyFn - extracts a `key` value from the arguments to `fn` to be used as the key to the cache
 * @param size - size of the cache.
 * @returns A function
 */
export function memorizerKeyBy<
    F extends (...args: any[]) => any,
    Args extends Parameters<F> = Parameters<F>,
    R extends ReturnType<F> = ReturnType<F>
>(fn: F, keyFn: (...args: Args) => string, size: number = defaultSize): (...args: Args) => R {
    let count = 0;
    let cacheL0: Record<string, R> = Object.create(null);
    let cacheL1: Record<string, R> = Object.create(null);
    return (...args: Args) => {
        const key = keyFn(...args);
        if (key in cacheL0) return cacheL0[key];

        const v = key in cacheL1 ? cacheL1[key] : fn(...args);
        if (count >= size) {
            cacheL1 = cacheL0;
            cacheL0 = Object.create(null);
            count = 0;
        }
        cacheL0[key] = v;
        ++count;
        return v;
    };
}

/**
 * Creates a function that will call `fn` exactly once when invoked and remember the value returned.
 * All subsequent calls will return exactly same value.
 * @param fn - function to call
 * @returns a new function
 */
export function callOnce<T>(fn: () => T): () => T {
    let last: { value: T } | undefined;
    return () => {
        if (last) {
            return last.value;
        }
        last = {
            value: fn(),
        };
        return last.value;
    };
}

/**
 * Create a function that will memorize all calls to `fn` to ensure that `fn` is
 * called exactly once for each unique set of arguments.
 * @param fn - function to memorize
 * @returns a function
 */
export function memorizerAll<K extends any[], T>(fn: (...p: K) => T): (...p: K) => T {
    type N = M<K, T>;
    const r: N = {};

    function find(p: K): N | undefined {
        let n: N | undefined = r;
        for (const k of p) {
            if (!n) break;
            n = n.c?.get(k);
        }
        return n;
    }

    function set(p: K, v: T) {
        let n = r;
        for (const k of p) {
            const c = n.c?.get(k);
            if (c) {
                n = c;
                continue;
            }
            const r: N = {};
            n.c = n.c || new Map<K, N>();
            n.c.set(k, r);
            n = r;
        }
        n.v = v;
    }

    return (...p: K): T => {
        const f = find(p);
        if (f && 'v' in f) {
            return f.v;
        }
        const v = fn(...p);
        set(p, v);
        return v;
    };
}

interface M<Key, Value> {
    v?: Value;
    c?: Map<Key, M<Key, Value>>;
}
