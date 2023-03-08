import { isArrayEqual } from './util';

/**
 * Create a function that memorizes the last call. If the next call is called with the same arguments, the
 * the last value is returned.
 * @param fn - function to memorize
 * @returns a new function.
 */

export function memorizeLastCall<T>(fn: (...p: []) => T): (...p: []) => T;
export function memorizeLastCall<T, K0>(fn: (...p: [K0]) => T): (...p: [K0]) => T;
export function memorizeLastCall<T, K0, K1>(fn: (...p: [K0, K1]) => T): (...p: [K0, K1]) => T;
export function memorizeLastCall<T, K0, K1, K2>(fn: (...p: [K0, K1, K2]) => T): (...p: [K0, K1, K2]) => T;
export function memorizeLastCall<T, K0, K1, K2, K3>(fn: (...p: [K0, K1, K2, K3]) => T): (...p: [K0, K1, K2, K3]) => T;
export function memorizeLastCall<T, K>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T;
export function memorizeLastCall<T, K>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T {
    let last: { args: K[]; value: T } | undefined;
    return (...p: [...K[]]) => {
        if (last && isArrayEqual(last.args, p)) {
            return last.value;
        }
        const args = p;
        const value = fn(...args);
        last = { args, value };
        return value;
    };
}
