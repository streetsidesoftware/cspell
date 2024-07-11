export function* iteratorToIterable<T>(iterator: Iterator<T>): Iterable<T> {
    try {
        let n: IteratorResult<T>;
        while (!(n = iterator.next()).done) {
            yield n.value;
        }
    } catch (e) {
        if (iterator.throw) {
            return iterator.throw(e);
        }
        throw e;
    } finally {
        // ensure that clean up happens.
        iterator.return?.();
    }
}

export async function* asyncIteratorToAsyncIterable<T>(iterator: AsyncIterator<T> | Iterator<T>): AsyncIterable<T> {
    try {
        let n: IteratorResult<T>;
        while (!(n = await iterator.next()).done) {
            yield n.value;
        }
    } catch (e) {
        if (iterator.throw) {
            return iterator.throw(e);
        }
        throw e;
    } finally {
        // ensure that clean up happens.
        iterator.return?.();
    }
}
