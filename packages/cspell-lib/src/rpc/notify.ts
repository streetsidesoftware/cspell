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
    #handlers: Set<NotifyHandler<T>> = new Set();

    /**
     * Adds a handler for the event. Multiple handlers can be added. The same handler will
     * not be added more than once. To add the same handler multiple times, use a wrapper function.
     *
     * Note: This function can be used without needing to bind 'this'.
     * @param handler - the handler to add.
     * @returns a Disposable to remove the handler.
     */
    readonly event: NotifyEvent<T> = (handler) => this.#event(handler);

    /**
     * Notify all handlers of the event.
     *
     * Note: This function can be used without needing to bind 'this'.
     * @param value - The event value.
     */
    readonly notify: (value: T) => void = (value) => this.#notify(value);

    /**
     * The number of registered handlers.
     */
    get size(): number {
        return this.#handlers.size;
    }

    #event(handler: NotifyHandler<T>): Disposable {
        this.#handlers.add(handler);
        return {
            [Symbol.dispose]: () => {
                this.#handlers.delete(handler);
            },
        };
    }

    /**
     * Notify all handlers of the event.
     * @param value - The event value.
     */
    #notify(value: T): void {
        for (const handler of this.#handlers) {
            handler(value);
        }
    }

    [Symbol.dispose](): void {
        this.#handlers.clear();
    }
}

/**
 * Convert a NotifyEvent to a Promise.
 * @param event - The event to convert.
 * @returns
 */
export function notifyEventToPromise<T>(event: NotifyEvent<T>): Promise<T> {
    const once = notifyEventOnce(event);
    return new Promise<T>((resolve) => {
        once(resolve);
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
            disposable[Symbol.dispose]();
            handler(e);
        });
        return disposable;
    }
    return notifyOnce as NotifyOnceEvent<T>;
}
