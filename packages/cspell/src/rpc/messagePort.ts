export interface MessagePortLike {
    /**
     * Sends a message to the port.
     * @param message - anything supported by postMessage
     */
    postMessage(message: unknown): void;

    /**
     * Sets a function to handle the 'close' event.
     */
    addListener(event: 'close', listener: (ev: Event) => void): this;
    /**
     * Sets a function to handle messages received on the port.
     * Set to undefined to remove the handler.
     */
    addListener(event: 'message', listener: (value: unknown) => void): this;
    /**
     * Sets a function to handle message errors received on the port.
     * Set to undefined to remove the handler.
     */
    addListener(event: 'messageerror', listener: (error: Error) => void): this;

    removeListener(event: 'close', listener: (ev: Event) => void, options?: EventListenerOptions): this;
    removeListener(event: 'message', listener: (value: unknown) => void, options?: EventListenerOptions): this;
    removeListener(event: 'messageerror', listener: (error: Error) => void, options?: EventListenerOptions): this;

    /**
     * Closes the port and stops it from receiving messages.
     */
    close(): void;

    /**
     * Start receiving messages on the port.
     * Note: Some MessagePort implementations may start automatically.
     */
    start(): void;
}
