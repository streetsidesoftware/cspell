import { IterableLike } from './IterableLike';

export function* toIterableIterator<T>(i: IterableLike<T>) {
    yield* i;
}

export function* concatIterables<T>(...iterables: IterableLike<T>[]) {
    for (const i of iterables) {
        yield* i;
    }
}
