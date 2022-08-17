/**
 * Allows an iterable to be shared by multiple consumers.
 * Each consumer takes from the iterable.
 * @param iterable - the iterable to share
 */
export function toDistributableIterableSync<T>(iterable: Iterable<T>): Iterable<T> {
    let lastValue: IteratorResult<T>;
    let iter: Iterator<T> | undefined;

    function getNext(): IteratorResult<T> {
        if (lastValue && lastValue.done) {
            return { ...lastValue };
        }
        iter = iter || iterable[Symbol.iterator]();
        lastValue = iter.next();
        return lastValue;
    }

    function* iterableFn() {
        let next: IteratorResult<T>;
        while (!(next = getNext()).done) {
            yield next.value;
        }
    }

    return {
        [Symbol.iterator]: iterableFn,
    };
}

/**
 * Allows an iterable to be shared by multiple consumers.
 * Each consumer takes from the iterable.
 * @param iterable - the iterable to share
 */
export const toDistributableIterable = toDistributableIterableSync;
