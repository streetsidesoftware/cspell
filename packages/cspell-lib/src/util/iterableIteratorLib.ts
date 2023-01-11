import type { IterableLike } from './IterableLike';

export function* toIterableIterator<T>(i: IterableLike<T>): IterableIterator<T> {
    yield* i;
}

export function* concatIterables<T>(...iterables: IterableLike<T>[]): IterableIterator<T> {
    for (const i of iterables) {
        yield* i;
    }
}
