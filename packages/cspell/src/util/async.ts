function asyncMap<T, U = T>(mapFn: (v: T) => U): (iter: AsyncIterable<T>) => AsyncIterable<U> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            yield mapFn(v);
        }
    }

    return fn;
}

function syncMap<T, U = T>(mapFn: (v: T) => U): (iter: Iterable<T>) => Iterable<U> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            yield mapFn(v);
        }
    }
    return fn;
}

export const map = <T, U>(fn: (v: T) => U) => toPipeFn(syncMap(fn), asyncMap(fn));

function asyncFilter<T>(filterFn: (v: T) => boolean): (iter: AsyncIterable<T>) => AsyncIterable<T> {
    async function* fn(iter: Iterable<T> | AsyncIterable<T>) {
        for await (const v of iter) {
            if (filterFn(v)) yield v;
        }
    }

    return fn;
}

function syncFilter<T>(filterFn: (v: T) => boolean): (iter: Iterable<T>) => Iterable<T> {
    function* fn(iter: Iterable<T>) {
        for (const v of iter) {
            if (filterFn(v)) yield v;
        }
    }

    return fn;
}

async function* _asyncAwait<T>(iter: AsyncIterable<T>): AsyncIterable<Awaited<T>> {
    for await (const v of iter) {
        yield v;
    }
}

export function asyncAwait<T>(): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>> {
    return _asyncAwait;
}

export const filter = <T>(fn: (i: T) => boolean) => toPipeFn(syncFilter(fn), asyncFilter(fn));

interface PipeFnSync<T, U> {
    (iter: Iterable<T>): Iterable<U>;
    /** This is just to help TypeScript figure out the type. */
    __PipeFnSync__?: [T, U];
}

interface PipeFnAsync<T, U> {
    (iter: AsyncIterable<T>): AsyncIterable<U>;
    /** This is just to help TypeScript figure out the type. */
    __PipeFnAsync__?: [T, U];
}

type PipeFn<T, U> = PipeFnSync<T, U> & PipeFnAsync<T, U>;

function toPipeFn<T, U = T>(syncFn: PipeFnSync<T, U>, asyncFn: PipeFnAsync<T, U>): PipeFn<T, U> {
    function _(i: Iterable<T>): Iterable<U>;
    function _(i: AsyncIterable<T>): AsyncIterable<U>;
    function _(i: Iterable<T> | AsyncIterable<T>): Iterable<U> | AsyncIterable<U> {
        return isAsyncIterable(i) ? asyncFn(i) : syncFn(i);
    }
    return _;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// type Rest = [...any];

export function pipeAsync<T>(i: AnyIterable<T>): AsyncIterable<T>; // prettier-ignore
export function pipeAsync<T, T0>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0]>): AsyncIterable<T0>; // prettier-ignore
export function pipeAsync<T, T0, T1>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1]>): AsyncIterable<T1>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2]>): AsyncIterable<T2>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3]>): AsyncIterable<T3>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4]>): AsyncIterable<T4>; // prettier-ignore
export function pipeAsync<T, T0, T1, T2, T3, T4, T5>(i: AnyIterable<T>, ...f: PipeAsyncTx<[T, T0, T1, T2, T3, T4, T5]>): AsyncIterable<T5>; // prettier-ignore

export function pipeAsync<T>(i: AnyIterable<T>, ...fns: PaFn<T, T>[]): AsyncIterable<T> {
    let iter = toAsyncIterable(i);
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}

type PsFn<T, U> = PipeFnSync<T, U> | ((i: Iterable<T>) => Iterable<U>);

export function pipeSync<T>(i: Iterable<T>): Iterable<T>; // prettier-ignore
export function pipeSync<T, T0 = T>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0]>): Iterable<T0>; // prettier-ignore
export function pipeSync<T, T0, T1>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1]>): Iterable<T1>; // prettier-ignore
export function pipeSync<T, T0, T1, T2>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2]>): Iterable<T2>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3]>): Iterable<T3>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4]>): Iterable<T4>; // prettier-ignore
export function pipeSync<T, T0, T1, T2, T3, T4, T5>(i: Iterable<T>, ...f: PipeSyncTx<[T, T0, T1, T2, T3, T4, T5]>): Iterable<T5>; // prettier-ignore
export function pipeSync<T>(i: Iterable<T>, ...fns: PsFn<T, T>[]): Iterable<T> {
    let iter: Iterable<T> = i;
    for (const fn of fns) {
        iter = fn(iter);
    }
    return iter;
}

type AnyIterable<T> = Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>> | Iterable<Promise<T>>;

export function mergeAsyncIterables<T>(iter: Iterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AsyncIterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: Promise<Iterable<T>>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AnyIterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AnyIterable<T>, ...rest: AnyIterable<T>[]): AsyncIterable<T>; // prettier-ignore

/**
 * Merge multiple iterables into an AsyncIterable
 * @param iter - initial iterable.
 * @param rest - iterables to merge.
 */
export async function* mergeAsyncIterables<T>(
    iter: Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>>,
    ...rest: (Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>>)[]
): AsyncIterableIterator<T> {
    for await (const i of [iter, ...rest]) {
        yield* i;
    }
}

/**
 * Convert one or more iterables to an AsyncIterable
 */
export const toAsyncIterable = mergeAsyncIterables;

export async function asyncIterableToArray<T>(iter: Iterable<T> | AsyncIterable<T>): Promise<Awaited<T>[]> {
    const r: Awaited<T>[] = [];

    for await (const t of iter) {
        r.push(t);
    }
    return r;
}

export function isAsyncIterable<T>(i: AnyIterable<T>): i is AsyncIterable<T> {
    return typeof (<AsyncIterable<T>>i)[Symbol.asyncIterator] === 'function';
}

type PaFn<T, U> = PipeFnAsync<T, U> | ((i: AsyncIterable<T>) => AsyncIterable<U>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PipeAsyncTx<T extends [...any]> = T extends [infer Left, infer Right, ...infer Rest]
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rest extends [any, ...any]
        ? [PaFn<Left, Right>, ...PipeAsyncTx<[Right, ...Rest]>]
        : [PaFn<Left, Right>]
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PipeSyncTx<T extends [...any]> = T extends [infer Left, infer Right, ...infer Rest]
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rest extends [any, ...any]
        ? [PsFn<Left, Right>, ...PipeSyncTx<[Right, ...Rest]>]
        : [PsFn<Left, Right>]
    : never;

//  type Last<T extends [...any]> = T extends [infer U, ...infer R] ? (R extends [any, ...any] ? Last<R> : U) : never;
