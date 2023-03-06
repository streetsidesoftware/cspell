import assert from 'assert';

export function* prefetchIterable<T>(iterable: Iterable<T>, size: number): Iterable<T> {
    assert(size >= 0);

    const iter = iterable[Symbol.iterator]();

    const buffer: T[] = [];

    for (let next = iter.next(); !next.done; next = iter.next()) {
        buffer.push(next.value);
        if (buffer.length >= size - 1) {
            const value = buffer[0];
            buffer.shift();
            yield value;
        }
    }

    yield* buffer;
}
