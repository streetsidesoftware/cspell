import { createSyncFn as _createSyncFn } from 'synckit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
type Syncify<T extends AnyFn> = (...args: Parameters<T>) => Awaited<ReturnType<T>>;

export type CreateSyncFn<T extends AnyFn> = (workerPath: URL | string, timeoutOrOptions?: number) => Syncify<T>;

export function createSyncFn<T extends AnyFn>(workerPath: URL | string, timeoutOrOptions?: number): Syncify<T> {
    return _createSyncFn(workerPath, timeoutOrOptions);
}

// cspell:ignore Syncify
