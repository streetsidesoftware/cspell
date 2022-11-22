export function* iteratorToIterable<T>(iterator: Iterator<T>): Iterable<T> {
    let n: IteratorResult<T>;
    while (!(n = iterator.next()).done) {
        yield n.value;
    }
}

export async function* asyncIteratorToAsyncIterable<T>(iterator: AsyncIterator<T> | Iterator<T>): AsyncIterable<T> {
    let n: IteratorResult<T>;
    while (!(n = await iterator.next()).done) {
        yield n.value;
    }
}
