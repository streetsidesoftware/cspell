import { AnyIterable, PaFn, PipeAsyncTx, PipeSyncTx, PsFn } from './internalTypes';
import { toAsyncIterable } from './helpers';

// type Rest = [...any];

export function pipeAsync<T>(i: AnyIterable<T>): AsyncIterable<T>; // prettier-ignore
export function pipeAsync<T, T0>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0]>): AsyncIterable<T0>; // prettier-ignore
export function pipeAsync<T, T0, T1>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1]>): AsyncIterable<T1>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2]>): AsyncIterable<T2>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3]>): AsyncIterable<T3>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4]>): AsyncIterable<T4>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4, T5>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5]>): AsyncIterable<T5>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4, T5, T6>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5, T6]>): AsyncIterable<T6>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4, T5, T6, T7>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5, T6, T7]>): AsyncIterable<T7>; // prettier-ignore

export function pipeAsync<T>(i: AnyIterable<T>, ...fns: PaFn<T, T>[]): AsyncIterable<T> {
    let iter = toAsyncIterable(i);
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}

export function pipeSync<T>(i: Iterable<T>): Iterable<T>; // prettier-ignore
export function pipeSync<T, T0 = T>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0]>): Iterable<T0>; // prettier-ignore
export function pipeSync<T, T0, T1>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1]>): Iterable<T1>; // prettier-ignore
export function pipeSync<T, T0, T1, T2>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2]>): Iterable<T2>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3]>): Iterable<T3>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4]>): Iterable<T4>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4, T5>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5]>): Iterable<T5>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4, T5, T6>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5, T6]>): Iterable<T6>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4, T5, T6, T7>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5, T6, T7]>): Iterable<T7>; // prettier-ignore

export function pipeSync<T>(i: Iterable<T>, ...fns: PsFn<T, T>[]): Iterable<T> {
    let iter: Iterable<T> = i;
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}
