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
export class MessagePortEvents {
    #notifyMessage: NotifyEmitter<unknown> = new NotifyEmitter();
    #notifyClose: NotifyEmitter<Event> = new NotifyEmitter();
    #notifyMessageError: NotifyEmitter<Error> = new NotifyEmitter();
    #port: MessagePortLike;

    constructor(port: MessagePortLike) {
        this.#port = port;
        this.#port.addListener('message', this.#notifyMessage.notify);
        this.#port.addListener('messageerror', this.#notifyMessageError.notify);
        this.#port.addListener('close', this.#notifyClose.notify);
    }

    [Symbol.dispose](): void {
        this.#port.removeListener('message', this.#notifyMessage.notify);
        this.#port.removeListener('messageerror', this.#notifyMessageError.notify);
        this.#port.removeListener('close', this.#notifyClose.notify);
        this.#notifyMessage[Symbol.dispose]();
        this.#notifyClose[Symbol.dispose]();
        this.#notifyMessageError[Symbol.dispose]();
    }

    /**
     * Event fired when a message is received.
     */
    get event(): NotifyEvent<unknown> {
        return this.#notifyMessage.event;
    }

    /**
     * Event fired when the port is closed.
     */
    get eventClose(): NotifyEvent<Event> {
        return this.#notifyClose.event;
    }

    /**
     * Event fired when a message error is received.
     */
    get eventMessageError(): NotifyEvent<Error> {
        return this.#notifyMessageError.event;
    }
}
