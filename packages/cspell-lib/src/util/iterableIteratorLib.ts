import { IterableLike } from './IterableLike';

export function* toIterableIterator<T>(
    i: IterableLike<T>
): Generator<T, void, undefined> {
    yield* i;
}

export function* concatIterables<T>(
    ...iterables: IterableLike<T>[]
): Generator<T, void, undefined> {
    for (const i of iterables) {
        yield* i;
    }
}
