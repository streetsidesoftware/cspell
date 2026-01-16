import { randomUUID } from 'node:crypto';
import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import type { MessagePortLike } from './messagePort.js';
import { createRPCOkRequest, createRPCOkResponse, createRPCRequest, isRPCOkResponse } from './modelsHelpers.js';
import { RPCServer } from './server.js';

describe('RPC Server', () => {
    test('new RPCServer', () => {
        const channel = new MessageChannel();
        const port = channel.port1;
        spyOnPort(port);

        const api = {
            add: (a: number, b: number): number => a + b,
            sub: (a: number, b: number): number => a - b,
            mul: (a: number, b: number): number => a * b,
            div: (a: number, b: number): number => a / b,
        };

        const server = new RPCServer(port, api);
        expect(server).toBeDefined();
        expect(port.addListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(port.start).toHaveBeenCalled();
        server[Symbol.dispose]();
        expect(port.close).toHaveBeenCalled();
    });

    test('bad requests', async () => {
        const channel = new MessageChannel();
        const serverPort = channel.port1;
        const clientPort = channel.port2;
        const receivedMessages: unknown[] = [];

        const msgs = new AsyncMessageQueue(clientPort);

        msgs.onMessage = (msg) => {
            // console.log('Client received message: %o', msg);
            receivedMessages.push(msg);
        };

        spyOnPort(serverPort);

        const api = {
            add: (a: number, b: number): number => a + b,
            sub: (a: number, b: number): number => a - b,
            mul: (a: number, b: number): number => a * b,
            div: (a: number, b: number): number => a / b,
            length: 42,
        };

        const server = new RPCServer(serverPort, api, { returnMalformedRPCRequestError: true });

        clientPort.postMessage(createRPCRequest(randomUUID(), 'add', [10, 5]));

        // We do not expect an immediate response.
        expect(msgs.length).toBe(0);

        // Check a good one.
        expect((await msgs.next()).value.result).toEqual(15);

        // Send Random text
        clientPort.postMessage('Hello World');
        expect((await msgs.next()).value.error).toBeDefined();

        clientPort.postMessage({ foo: 'bar' });
        expect((await msgs.next()).value.error).toBeDefined();

        clientPort.postMessage(createRPCOkRequest(randomUUID()));
        const okResponse = await msgs.next();
        expect(okResponse.value).toEqual(createRPCOkResponse(okResponse.value.id, 200));
        expect(isRPCOkResponse(okResponse.value)).toBe(true);
        expect(okResponse.value.code).toBe(200);

        // Bad method
        clientPort.postMessage(createRPCRequest(randomUUID(), 'length unknown', []));
        expect((await msgs.next()).value.error).toBeDefined();

        await wait(10);

        server[Symbol.dispose]();

        expect(msgs.isClosed).toBe(false);
        msgs[Symbol.dispose]();

        expect(msgs.isStopped).toBe(true);
        expect(serverPort.close).toHaveBeenCalled();
        expect(receivedMessages.length).toBe(5);
    });
});

class AsyncMessageQueue implements AsyncIterator<unknown> {
    #close: () => void;
    #message: (msg: unknown) => void;
    #buffer: unknown[] = [];
    #port: MessagePortLike;
    #stop: boolean = false;
    #closed: boolean = false;
    #resolve: ((msg: unknown) => void) | undefined;
    onMessage: ((msg: unknown) => void) | undefined;

    constructor(port: MessagePortLike) {
        this.#port = port;
        this.#close = () => {
            this.#closed = true;
            this.#stop = true;
        };

        this.#message = (msg: unknown) => {
            const r = this.#resolve;
            this.#resolve = undefined;
            if (!r) {
                this.#buffer.push(msg);
                return;
            }
            r(msg);
            this.onMessage?.(msg);
        };

        this.#port.addListener('close', this.#close);
        this.#port.addListener('message', this.#message);
    }

    async next(): Promise<IteratorResult<unknown>> {
        if (this.#stop) {
            return { done: true, value: undefined };
        }
        if (this.#buffer.length > 0) {
            const value = this.#buffer.shift();
            return { done: false, value };
        }
        return new Promise<IteratorResult<unknown>>((resolve) => {
            this.#resolve = (value: unknown) => {
                resolve({ done: false, value });
            };
        });
    }

    get length(): number {
        return this.#buffer.length;
    }

    get isStopped(): boolean {
        return this.#stop;
    }

    get isClosed(): boolean {
        return this.#closed;
    }

    [Symbol.dispose]() {
        this.#stop = true;
        this.#port.removeListener('close', this.#close);
        this.#port.removeListener('message', this.#message);
    }
}

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
