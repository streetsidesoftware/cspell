import assert from 'assert';

export function* prefetchIterable<T>(iterable: Iterable<T>, size: number): Iterable<T> {
    assert(size >= 0);

    const buffer: T[] = [];

    for (const value of iterable) {
        buffer.push(value);
        if (buffer.length >= size - 1) {
            const value = buffer[0];
            buffer.shift();
            yield value;
        }
    }

    yield* buffer;
}
