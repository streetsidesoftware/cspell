export type OperatorSync<T, U = T> = (i: Iterable<T>) => Iterable<U>;
export type OperatorAsync<T, U = T> = (i: AsyncIterable<T>) => AsyncIterable<U>;
export type OperatorSyncToAsync<T, U = T> = (i: Iterable<T>) => AsyncIterable<U>;
