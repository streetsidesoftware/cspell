import { toError } from '../util/errors.js';

export interface Disposable {
    dispose(): void;
}

type EventListener<T, U = unknown> = (e: T) => U;

export interface EventFn<T, U = unknown> {
    /**
     * A function that represents an event to which you subscribe by calling it with
     * a listener function as argument.
     *
     * @param listener The listener function will be called when the event happens.
     * @returns A disposable which unsubscribes the event listener.
     */
    (listener: (e: T) => U): Disposable;
}

export type DisposableListener = Disposable;

export interface IEventEmitter<T> extends Disposable {
    readonly name: string;
    readonly on: EventFn<T>;
    fire(event: T): Error[] | undefined | void;
}

export function createEmitter<T>(name: string): IEventEmitter<T> {
    return new EventEmitter(name);
}

export class EventEmitter<T> implements IEventEmitter<T> {
    #listeners = new Set<EventListener<T>>();

    constructor(readonly name: string) {}

    /**
     * The event listeners can subscribe to.
     */
    readonly on = (listener: EventListener<T>): Disposable => {
        this.#listeners.add(listener);
        return {
            dispose: () => {
                this.#listeners.delete(listener);
            },
        };
    };

    /**
     * Notify all subscribers of the {@link EventEmitter.on event}. Failure
     * of one or more listener will not fail this function call.
     *
     * @param data The event object.
     */
    fire(event: T): undefined | Error[] {
        let errors: Error[] | undefined;
        for (const listener of this.#listeners) {
            try {
                listener(event);
            } catch (e) {
                errors = errors ?? [];
                errors.push(toError(e));
            }
        }
        return errors;
    }

    /**
     * Dispose this object and free resources.
     */
    readonly dispose = (): void => {
        this.#listeners.clear();
    };
}

/**
 * Event indicating that the cache should be cleared.
 */
class ClearCacheEvent extends EventEmitter<unknown> {
    constructor() {
        super(ClearCacheEvent.eventName);
    }
    static eventName = 'clear-cache' as const;
}

const clearCacheEvent = new ClearCacheEvent();

export function onClearCache(listener: () => void): DisposableListener {
    return clearCacheEvent.on(listener);
}

export function dispatchClearCache(): void {
    clearCacheEvent.fire(undefined);
}
