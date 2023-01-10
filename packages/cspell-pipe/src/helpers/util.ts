import type { AnyIterable, PipeFn, PipeFnAsync, PipeFnSync } from '../internalTypes.js';

export function toPipeFn<T, U = T>(syncFn: PipeFnSync<T, U>, asyncFn: PipeFnAsync<T, U>): PipeFn<T, U> {
    function _(i: Iterable<T>): Iterable<U>;
    function _(i: AsyncIterable<T>): AsyncIterable<U>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<U> | AsyncIterable<U> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}

export function isAsyncIterable<T>(i: AnyIterable<T>): i is AsyncIterable<T> {
    return typeof (<AsyncIterable<T>>i)[Symbol.asyncIterator] === 'function';
}
