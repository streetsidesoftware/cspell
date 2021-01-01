/**
 * Reads an entire iterable and converts it into a promise.
 * @param asyncIterable - the async iterable to wait for.
 */
export async function toArray<T>(asyncIterable: AsyncIterable<T> | Iterable<T> | Iterable<Promise<T>>): Promise<T[]> {
    const data: T[] = [];
    for await (const item of asyncIterable) {
        data.push(item);
    }
    return data;
}
