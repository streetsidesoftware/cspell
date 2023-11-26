/**
 * Event indicating that the cache should be cleared.
 */
export class ClearCacheEvent extends Event {
    constructor() {
        super(ClearCacheEvent.eventName);
    }
    static eventName = 'clear-cache' as const;
}

export type EventNames = typeof ClearCacheEvent.eventName;

export type EventTypes = ClearCacheEvent;

const eventEmitter = new EventTarget();

export interface DisposableListener {
    dispose(): void;
}

export function addEventListener(event: EventNames, listener: (event: ClearCacheEvent) => void): DisposableListener;
export function addEventListener(event: string, listener: (event: Event) => void): DisposableListener {
    eventEmitter.addEventListener(event, listener);
    return {
        dispose() {
            eventEmitter.removeEventListener(event, listener);
        },
    };
}

export function dispatchEvent(event: EventTypes): void {
    eventEmitter.dispatchEvent(event);
}

export function onClearCache(listener: () => void): DisposableListener {
    return addEventListener(ClearCacheEvent.eventName, listener);
}

export function dispatchClearCache(): void {
    dispatchEvent(new ClearCacheEvent());
}
