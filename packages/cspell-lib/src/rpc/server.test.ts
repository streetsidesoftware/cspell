import { randomUUID } from 'node:crypto';
import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import type { MessagePortLike } from './messagePort.js';
import { MessagePortNotifyEvents } from './MessagePortEvents.js';
import type { RPCResponse } from './models.js';
import { createRPCMethodRequest, createRPCOkRequest, createRPCOkResponse, isRPCOkResponse } from './modelsHelpers.js';
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

        const server = new RPCServer({ port }, api);
        expect(server).toBeDefined();
        expect(port.addListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(port.start).toHaveBeenCalled();
        server[Symbol.dispose]();
        expect(port.close).not.toHaveBeenCalled();
    });

    test('new RPCServer auto close', () => {
        const channel = new MessageChannel();
        const port = channel.port1;
        spyOnPort(port);

        const api = {
            add: (a: number, b: number): number => a + b,
            sub: (a: number, b: number): number => a - b,
            mul: (a: number, b: number): number => a * b,
            div: (a: number, b: number): number => a / b,
        };

        const server = new RPCServer({ port, closePortOnDispose: true }, api);
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
        using clientEvents = new MessagePortNotifyEvents(clientPort);
        clientEvents.onMessage((msg) => receivedMessages.push(msg));
        const nextMsg = clientEvents.awaitNextMessage as () => Promise<RPCResponse>;

        spyOnPort(serverPort);

        const api = {
            add: (a: number, b: number): number => a + b,
            sub: (a: number, b: number): number => a - b,
            mul: (a: number, b: number): number => a * b,
            div: (a: number, b: number): number => a / b,
            length: 42,
        };

        using _server = new RPCServer({ port: serverPort, returnMalformedRPCRequestError: true }, api);
        const readyMsg = await nextMsg();
        expect(readyMsg.type).toEqual('ready');
        expect(receivedMessages.length).toBe(1);

        clientPort.postMessage(createRPCMethodRequest(randomUUID(), 'add', [10, 5]));

        // We do not expect an immediate response.
        expect(receivedMessages.length).toBe(1);

        // Check a good one.
        expect((await nextMsg()).result).toEqual(15);

        // Send Random text
        clientPort.postMessage('Hello World');
        expect((await nextMsg()).error).toBeDefined();

        clientPort.postMessage({ foo: 'bar' });
        expect((await nextMsg()).error).toBeDefined();

        clientPort.postMessage(createRPCOkRequest(randomUUID()));
        const okResponse = await nextMsg();
        expect(okResponse).toEqual(createRPCOkResponse(okResponse.id, 200));
        expect(isRPCOkResponse(okResponse)).toBe(true);
        expect(okResponse.code).toBe(200);

        // Bad method
        clientPort.postMessage(createRPCMethodRequest(randomUUID(), 'length unknown', []));
        expect((await nextMsg()).error).toBeDefined();

        expect(receivedMessages.length).toBe(6);

        await wait(10);
    });
});

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
