import type { PaFn, PipeAsyncTx, PipeSyncTx, PsFn } from '../internalTypes.js';
import type { OperatorAsync, OperatorSync } from './types.js';

export function opCombineAsync<T>(): OperatorAsync<T>; // prettier-ignore
export function opCombineAsync<T, T0>(...f: PipeAsyncTx<[T, T0]>): OperatorAsync<T0>; // prettier-ignore
export function opCombineAsync<T, T0, T1>(...f: PipeAsyncTx<[T, T0, T1]>): OperatorAsync<T1>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2>(...f: PipeAsyncTx<[T, T0, T1, T2]>): OperatorAsync<T2>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2, T3>(...f: PipeAsyncTx<[T, T0, T1, T2, T3]>): OperatorAsync<T3>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2, T3, T4>(...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4]>): OperatorAsync<T4>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2, T3, T4, T5>(...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5]>): OperatorAsync<T5>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2, T3, T4, T5, T6>(...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5, T6]>): OperatorAsync<T6>; // prettier-ignore
export function opCombineAsync<T, T0, T1, T2, T3, T4, T5, T6, T7>(...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5, T6, T7]>): OperatorAsync<T7>; // prettier-ignore
export function opCombineAsync<T>(...fns: PaFn<T, T>[]): OperatorAsync<T>;
export function opCombineAsync<T>(...fns: PaFn<T, T>[]): OperatorAsync<T> {
    function combine(iter: AsyncIterable<T>) {
        for (const fn of fns) {
            iter = fn(iter);
        }
        return iter;
    }
    return combine;
}

export function opCombineSync<T>(): OperatorSync<T>; // prettier-ignore
export function opCombineSync<T, T0 = T>(...f: PipeSyncTx<[T, T0]>): OperatorSync<T0>; // prettier-ignore
export function opCombineSync<T, T0, T1>(...f: PipeSyncTx<[T, T0, T1]>): OperatorSync<T1>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2>(...f: PipeSyncTx<[T, T0, T1, T2]>): OperatorSync<T2>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2, T3>(...f: PipeSyncTx<[T, T0, T1, T2, T3]>): OperatorSync<T3>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2, T3, T4>(...f: PipeSyncTx<[T, T0, T1, T2, T3, T4]>): OperatorSync<T4>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2, T3, T4, T5>(...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5]>): OperatorSync<T5>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2, T3, T4, T5, T6>(...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5, T6]>): OperatorSync<T6>; // prettier-ignore
export function opCombineSync<T, T0, T1, T2, T3, T4, T5, T6, T7>(...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5, T6, T7]>): OperatorSync<T7>; // prettier-ignore
export function opCombineSync<T>(...fns: PsFn<T, T>[]): OperatorSync<T>;
export function opCombineSync<T>(...fns: PsFn<T, T>[]): OperatorSync<T> {
    function combine(iter: Iterable<T>) {
        for (const fn of fns) {
            iter = fn(iter);
        }
        return iter;
    }
    return combine;
}
