async function* _asyncAwait<T>(iter: AsyncIterable<T>): AsyncIterable<Awaited<T>> {
    for await (const v of iter) {
        yield v;
    }
}

export function asyncAwait<T>(): (iter: AsyncIterable<T>) => AsyncIterable<Awaited<T>> {
    return _asyncAwait;
}
