import { Mock, vi } from 'vitest';

export function* generatorTestWrapper<T>(values: Iterable<T>, options?: IterableTestWrapperOptions): Iterable<T> {
    const iter = iterableTestWrapper(values, options)[Symbol.iterator]();
    try {
        let n: IteratorResult<T>;
        while (!(n = iter.next()).done) {
            yield n.value;
        }
    } catch (e) {
        if (iter.throw) {
            return iter.throw(e);
        }
        throw e;
    } finally {
        // Do nothing.
        iter.return?.();
    }
}

export function makeIterableTestWrapperOptions(): IterableTestWrapperOptions {
    return {
        returnCalled: vi.fn(),
        throwCalled: vi.fn(),
        nextCalled: vi.fn(),
        nextReturned: vi.fn(),
    };
}

export interface IterableTestWrapperOptions {
    returnCalled: Mock;
    throwCalled: Mock;
    nextCalled: Mock;
    nextReturned: Mock;
}

export interface IterableTestWrap<T> extends Iterable<T>, IterableTestWrapperOptions {}

export function iterableTestWrapper<T>(
    iterable: Iterable<T>,
    options?: IterableTestWrapperOptions,
): IterableTestWrap<T> {
    let iter: Iterator<T> | undefined = undefined;

    type TReturn = any;
    type TNext = undefined;

    function getIterator() {
        if (iter) {
            return iter;
        }
        return (iter = iterable[Symbol.iterator]());
    }

    const wrapper = {
        returnCalled: vi.fn(),
        throwCalled: vi.fn(),
        nextCalled: vi.fn(),
        nextReturned: vi.fn(),
        ...options,
        [Symbol.iterator]() {
            return {
                next: (...args: [] | [TNext]) => {
                    const iter = getIterator();
                    wrapper.nextCalled(...args);
                    const v = iter.next(...args);
                    wrapper.nextReturned(v);
                    return v;
                },
                return: (v?: TReturn): IteratorResult<T, TReturn> => {
                    wrapper.returnCalled(v);
                    return getIterator().return?.(v) || { done: true, value: v };
                },
                throw: (e?: any): IteratorResult<T, TReturn> => {
                    wrapper.throwCalled(e);
                    const iter = getIterator();
                    if (iter.throw) {
                        return iter.throw(e);
                    }
                    throw e;
                },
            };
        },
    };

    return wrapper;
}
