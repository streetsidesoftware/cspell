import { AnyIterable } from '../internalTypes';

export function mergeAsyncIterables<T>(iter: Iterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AsyncIterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: Promise<Iterable<T>>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AnyIterable<T>): AsyncIterable<T>;
export function mergeAsyncIterables<T>(iter: AnyIterable<T>, ...rest: AnyIterable<T>[]): AsyncIterable<T>; // prettier-ignore

/**
 * Merge multiple iterables into an AsyncIterable
 * @param iter - initial iterable.
 * @param rest - iterables to merge.
 */
export async function* mergeAsyncIterables<T>(
    iter: Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>>,
    ...rest: (Iterable<T> | AsyncIterable<T> | Promise<Iterable<T>>)[]
): AsyncIterableIterator<T> {
    for await (const i of [iter, ...rest]) {
        yield* i;
    }
}

/**
 * Convert one or more iterables to an AsyncIterable
 */
export const toAsyncIterable = mergeAsyncIterables;
