export interface PipeFnSync<T, U> {
    (iter: Iterable<T>): Iterable<U>;
    /** This is just to help TypeScript figure out the type. */
    __PipeFnSync__?: [T, U];
}

export interface PipeFnAsync<T, U> {
    (iter: AsyncIterable<T>): AsyncIterable<U>;
    /** This is just to help TypeScript figure out the type. */
    __PipeFnAsync__?: [T, U];
}

export type PipeFn<T, U> = PipeFnSync<T, U> & PipeFnAsync<T, U>;

export type PsFn<T, U> = PipeFnSync<T, U> | ((i: Iterable<T>) => Iterable<U>);

export type AnyIterable<T> = Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>> | Iterable<Promise<T>>;

export type PaFn<T, U> = PipeFnAsync<T, U> | ((i: AsyncIterable<T>) => AsyncIterable<U>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PipeAsyncTx<T extends [...any]> = T extends [infer Left, infer Right, ...infer Rest]
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rest extends [any, ...any]
        ? [PaFn<Left, Right>, ...PipeAsyncTx<[Right, ...Rest]>]
        : [PaFn<Left, Right>]
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PipeSyncTx<T extends [...any]> = T extends [infer Left, infer Right, ...infer Rest]
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rest extends [any, ...any]
        ? [PsFn<Left, Right>, ...PipeSyncTx<[Right, ...Rest]>]
        : [PsFn<Left, Right>]
    : never;
