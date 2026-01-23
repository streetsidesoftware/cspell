import { AlreadyDisposedError } from './errors.js';

export type NotifyHandler<T> = (event: T) => void;

export type NotifyEvent<T> = (handler: NotifyHandler<T>) => Disposable;

/**
 * Used to have a type distinction between NotifyOnceEvents and NotifyEvents.
 * It is not used at runtime.
 */
const SymbolNotifyOnceEvent: symbol = Symbol('NotifyOnceEvent');
export type NotifyOnceEvent<T> = NotifyEvent<T> & { [SymbolNotifyOnceEvent]?: true };

/**
 * A Class used to emit notifications to registered handlers.
 */
export class NotifyEmitter<T> {
    #handlers: Map<NotifyHandler<T>, Disposable> = new Map();
    #disposed = false;

    /**
     * Registers a handler for the event. Multiple handlers can be added. The same handler will
     * not be added more than once. To add the same handler multiple times, use a wrapper function.
     *
     * Events are Async, so the handler will NOT be called during the registration.
     *
     * Note: This function can be used without needing to bind 'this'.
     * @param handler - the handler to add.
     * @returns a Disposable to remove the handler.
     */
    readonly onEvent: NotifyEvent<T> = (handler) => this.#onEvent(handler);

    /**
     * Notify all handlers of the event.
     *
     * If a handler throws an error, the error is not caught and will propagate up the call stack.
     *
     * Note: This function can be used without needing to bind 'this'.
     * @param value - The event value.
     */
    readonly notify: (value: T) => void = (value) => this.#notify(value);

    /**
     * A NotifyEvent that only fires once for each handler added.
     *
     * Multiple handlers can be added. The same handler can be added multiple times
     * and will be called once for each time it is added.
     *
     * Note: This property can be used without needing to bind 'this'.
     */
    readonly once: NotifyOnceEvent<T> = notifyEventOnce(this.onEvent);

    /**
     * Get a Promise that resolves with the next event.
     * @param signal - A signal to abort the wait.
     * @returns a Promise that will resolve with the next value emitted.
     */
    readonly awaitNext: (signal?: AbortSignal) => Promise<T> = (signal?: AbortSignal) =>
        notifyEventToPromise(this.onEvent, signal);

    /**
     * The number of registered handlers.
     */
    get size(): number {
        return this.#handlers.size;
    }

    /**
     * Removes all registered handlers.
     */
    clear(): void {
        this.#handlers.clear();
    }

    #onEvent(handler: NotifyHandler<T>): Disposable {
        if (this.#disposed) {
            throw new AlreadyDisposedError();
        }
        const found = this.#handlers.get(handler);
        if (found) {
            return found;
        }
        let disposed = false;
        const disposable = {
            [Symbol.dispose]: () => {
                if (disposed) return;
                disposed = true;
                this.#handlers.delete(handler);
            },
        };
        this.#handlers.set(handler, disposable);
        return disposable;
    }

    /**
     * Notify all handlers of the event.
     * @param value - The event value.
     */
    #notify(value: T): void {
        for (const handler of [...this.#handlers.keys()]) {
            handler(value);
        }
    }

    [Symbol.dispose](): void {
        if (this.#disposed) return;
        this.#disposed = true;
        this.#handlers.clear();
    }
}

/**
 * Convert a NotifyEvent to a Promise.
 * @param event - The event to convert.
 * @param signal - Optional AbortSignal to cancel the subscription if the promise is abandoned.
 * @returns A Promise that resolves with the first value emitted by the event.
 */
export function notifyEventToPromise<T>(event: NotifyEvent<T>, signal?: AbortSignal): Promise<T> {
    const once = notifyEventOnce(event);
    return new Promise<T>((resolve, reject) => {
        signal?.throwIfAborted();

        const disposable = once((value) => {
            signal?.removeEventListener('abort', onAbort);
            resolve(value);
        });

        function onAbort() {
            disposable[Symbol.dispose]();
            signal?.removeEventListener('abort', onAbort);
            reject(signal?.reason);
        }

        signal?.addEventListener('abort', onAbort, { once: true });
    });
}

/**
 * Create a NotifyEvent that only fires once.
 *
 * The same handler can be added multiple times and will be called once for each time it is added.
 * This is different from a normal NotifyEvent where the same handler is only added once.
 *
 * @param event - The event to wrap.
 * @returns A NotifyOnceEvent that only fires once for the handlers added.
 */
export function notifyEventOnce<T>(event: NotifyEvent<T>): NotifyOnceEvent<T> {
    function notifyOnce(handler: NotifyHandler<T>): Disposable {
        const disposable = event((e) => {
            // A NotifyEvent should register a handler, but never call it immediately.
            // Therefor the disposable should always be defined here. A ReferenceError
            // would indicate a bug in NotifyEmitter or NotifyEvent implementation.
            disposable[Symbol.dispose]();
            handler(e);
        });
        return disposable;
    }

    return notifyOnce as NotifyOnceEvent<T>;
}
