export function throwAfter<T>(iterable: Iterable<T>, count: number, e: unknown): Iterable<T> {
    let iter: Iterator<T> | undefined = undefined;

    type TNext = undefined;

    const selfIterator: Iterator<T> = {
        next: (...args: [] | [TNext]) => {
            const iter = getIterator();
            if (count-- <= 0) {
                if (iter.throw) {
                    return iter.throw(e);
                }
                throw e;
            }
            return iter.next(...args);
        },
    };

    function getIterator() {
        if (iter) {
            return iter;
        }
        iter = iterable[Symbol.iterator]();

        if (iter.return) {
            selfIterator.return = iter.return.bind(iter);
        }

        if (iter.throw) {
            selfIterator.throw = iter.throw.bind(iter);
        }

        return iter;
    }

    return {
        [Symbol.iterator]() {
            return selfIterator;
        },
    };
}

export function throwAfterAsync<T>(iterable: AsyncIterable<T>, count: number, e: unknown): AsyncIterable<T> {
    let iter: AsyncIterator<T> | undefined = undefined;

    type TReturn = any;
    type TNext = undefined;

    function getIterator() {
        if (iter) {
            return iter;
        }
        return (iter = iterable[Symbol.asyncIterator]());
    }

    return {
        [Symbol.asyncIterator]() {
            return {
                next: (...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>> => {
                    const iter = getIterator();
                    if (count-- <= 0) {
                        if (iter.throw) {
                            return iter.throw(e);
                        }
                        throw e;
                    }
                    return iter.next(...args);
                },
                return: async (value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>> => {
                    return getIterator().return?.(value) || { done: true, value: await value };
                },
                throw: (e?: any): Promise<IteratorResult<T, TReturn>> => {
                    const iter = getIterator();
                    if (iter.throw) {
                        return iter.throw(e);
                    }
                    throw e;
                },
            };
        },
    };
}
