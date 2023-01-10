import { toPipeFn } from '../helpers/util.js';

/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
export function opTapAsync<T>(tapFn: (v: T) => void): (iter: AsyncIterable<T>) => AsyncIterable<T> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            tapFn(v);
            yield v;
        }
    }

    return fn;
}

/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
export function opTapSync<T>(tapFn: (v: T) => void): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            tapFn(v);
            yield v;
        }
    }
    return fn;
}

/**
 * Tap allows you to listen on values, without modifying them.
 *
 * @param fn - function to call for each value.
 */
export const opTap = <T>(fn: (v: T) => void) => toPipeFn<T, T>(opTapSync(fn), opTapAsync(fn));
