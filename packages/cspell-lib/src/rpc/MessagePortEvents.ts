import type { MessagePortLike } from './messagePort.js';
import type { NotifyEvent } from './notify.js';
import { NotifyEmitter } from './notify.js';

/**
 * Wraps a {@link MessagePortLike} and exposes its key events through a
 * {@link NotifyEmitter}-based interface.
 *
 * This class listens to the underlying port's {@code message},
 * {@code messageerror}, and {@code close} events and re-emits them as
 * {@link NotifyEvent} instances, making it easier to subscribe to and manage
 * notifications from a message port.
 */
export class MessagePortNotifyEvents {
    #notifyMessage: NotifyEmitter<unknown> = new NotifyEmitter();
    #notifyClose: NotifyEmitter<Event> = new NotifyEmitter();
    #notifyMessageError: NotifyEmitter<Error> = new NotifyEmitter();
    #port: MessagePortLike;
    #disposed = false;

    constructor(port: MessagePortLike) {
        this.#port = port;
        this.#port.addListener('message', this.#notifyMessage.notify);
        this.#port.addListener('messageerror', this.#notifyMessageError.notify);
        this.#port.addListener('close', this.#notifyClose.notify);
    }

    [Symbol.dispose](): void {
        if (this.#disposed) return;
        this.#disposed = true;
        this.#port.removeListener('message', this.#notifyMessage.notify);
        this.#port.removeListener('messageerror', this.#notifyMessageError.notify);
        this.#port.removeListener('close', this.#notifyClose.notify);
        this.#notifyMessage[Symbol.dispose]();
        this.#notifyClose[Symbol.dispose]();
        this.#notifyMessageError[Symbol.dispose]();
    }

    /**
     * Register a handler to called when a message is received.
     */
    get onMessage(): NotifyEvent<unknown> {
        return this.#notifyMessage.onEvent;
    }

    nextMessage(signal?: AbortSignal): Promise<unknown> {
        return this.#notifyMessage.next(signal);
    }

    /**
     * Register a handler to called when the port is closed.
     */
    get onClose(): NotifyEvent<Event> {
        return this.#notifyClose.onEvent;
    }

    /**
     * Register a handler to called when a message error is received.
     */
    get onMessageError(): NotifyEvent<Error> {
        return this.#notifyMessageError.onEvent;
    }
}
