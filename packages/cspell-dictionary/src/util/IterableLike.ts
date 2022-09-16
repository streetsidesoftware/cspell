export interface IterableLike<T> {
    [Symbol.iterator]: () => Iterator<T> | IterableIterator<T>;
}
