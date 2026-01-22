import { randomUUID } from 'node:crypto';
import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import { assert } from './assert.js';
import { RPCClient } from './client.js';
import { AbortRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import {
    createRPCError,
    createRPCResponse,
    isRPCBaseMessage,
    isRPCCancelRequest,
    isRPCRequest,
} from './modelsHelpers.js';

describe('RPC Client', () => {
    test('new RPCClient', () => {
        const port = createPort();
        spyOnPort(port);
        const client = new RPCClient<any>({ port });
        expect(client).toBeDefined();
        expect(port.addListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(port.start).toHaveBeenCalled();
        client[Symbol.dispose]();
        expect(port.close).not.toHaveBeenCalled();
    });

    test('new RPCClient auto close', () => {
        const port = createPort();
        spyOnPort(port);
        const client = new RPCClient<any>({ port, closePortOnDispose: true });
        expect(client).toBeDefined();
        expect(port.addListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(port.start).toHaveBeenCalled();
        client[Symbol.dispose]();
        expect(port.close).toHaveBeenCalled();
    });

    test('sending and receiving a response', async () => {
        const serverApi = {
            sum: (a: number, b: number): number => a + b,
            mul: (a: number, b: number): number => a * b,
        } as const;

        type ServerApi = typeof serverApi;

        const mockPort = createPort(attachHandler);

        const client = new RPCClient<ServerApi>({ port: mockPort });

        expect(client).toBeDefined();

        const result = await client.call('sum', [2, 3]);
        expect(result).toBe(5);

        const result2 = await client.call('mul', [2, 3]);
        expect(result2).toBe(6);

        const api = client.getApi(['sum', 'mul']);
        const result3 = await api.sum(10, 15);
        expect(result3).toBe(25);
        const result4 = await api.mul(10, 15);
        expect(result4).toBe(150);

        function isKeyOfServerApi(key: string): key is keyof ServerApi {
            return key in serverApi;
        }

        function attachHandler(port: MessagePortLike) {
            port.addListener('message', handleMessage);
            return;

            function handleMessage(msg: unknown) {
                expect(msg).toBeDefined();
                expect(isRPCBaseMessage(msg)).toBe(true);
                assert(isRPCBaseMessage(msg));
                expect(isRPCRequest(msg)).toBe(true);
                assert(isRPCRequest(msg));
                const method = msg.method;
                if (isKeyOfServerApi(method)) {
                    assert(isRPCRequest<[number, number]>(msg));
                    const result = serverApi[method](...msg.params);
                    const response = createRPCResponse(msg.id, result, 200);
                    respondWithDelay(port, response, 1);
                }
            }
        }
    });

    test('error response', async () => {
        const serverApi = {
            sum: (a: number, b: number): number => a + b,
            mul: (a: number, b: number): number => a * b,
        } as const;

        type ServerApi = typeof serverApi & { div: (a: number, b: number) => number };

        const mockPort = createPort(attachHandler);

        const client = new RPCClient<ServerApi>({ port: mockPort, randomUUID });
        expect(client).toBeDefined();

        const error = new Error('Method not found');

        await expect(client.call('sum', [2, 3])).resolves.toBe(5);

        await expect(client.call('div', [4, 2])).rejects.toThrowError(error);

        function isKeyOfServerApi(key: string): key is keyof ServerApi {
            return key in serverApi;
        }

        function attachHandler(port: MessagePortLike) {
            port.addListener('message', handleMessage);
            return;

            function handleMessage(msg: unknown) {
                expect(msg).toBeDefined();
                expect(isRPCBaseMessage(msg)).toBe(true);
                assert(isRPCBaseMessage(msg));
                expect(isRPCRequest(msg)).toBe(true);
                assert(isRPCRequest(msg));
                const method = msg.method;
                if (isKeyOfServerApi(method) && method !== 'div') {
                    assert(isRPCRequest<[number, number]>(msg));
                    const result = serverApi[method](...msg.params);
                    const response = createRPCResponse(msg.id, result, 200);
                    respondWithDelay(port, response, 1);
                    return;
                }

                respondWithDelay(port, createRPCError(msg.id, error, 400), 1);
            }
        }
    });

    test('abort request', async () => {
        interface ServerApi {
            sum: (a: number, b: number) => number;
            mul: (a: number, b: number) => number;
        }

        const port = createPort(attachHandler);
        const spyOnPostMessage = vi.spyOn(port, 'postMessage');

        const client = new RPCClient<ServerApi>({ port, randomUUID });

        expect(client).toBeDefined();

        const error = new Error('Error canceled by client');

        const request = client.request('sum', [2, 3]);
        const p = expect(request.response).rejects.toThrowError(
            new AbortRPCRequestError('Client is aborting the request'),
        );
        request.abort('Client is aborting the request');
        await p;

        expect(spyOnPostMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'cancel' }));

        function attachHandler(mockPort: MessagePortLike) {
            mockPort.addListener('message', handleMessage);
            return;
            function handleMessage(msg: unknown) {
                expect(msg).toBeDefined();
                expect(isRPCBaseMessage(msg)).toBe(true);
                assert(isRPCBaseMessage(msg));

                if (isRPCCancelRequest(msg)) {
                    respondWithDelay(mockPort, createRPCError(msg.id, error, 400), 1);
                }
            }
        }
    });

    test('abort request promise', async () => {
        interface ServerApi {
            sum: (a: number, b: number) => number;
            mul: (a: number, b: number) => number;
        }

        const mockPort = createPort(attachHandler);

        const client = new RPCClient<ServerApi>({ port: mockPort, randomUUID });

        expect(client).toBeDefined();

        const error = new Error('Error canceled by client');
        const errorAbort = new Error('Error aborted by client');

        const pResult = client.call('sum', [2, 3]);
        const p = expect(pResult).rejects.toThrowError(errorAbort);

        client.abortPromise(pResult, errorAbort);

        await p;

        function attachHandler(port: MessagePortLike) {
            port.addListener('message', handleMessage);
            return;

            function handleMessage(msg: unknown) {
                expect(msg).toBeDefined();
                expect(isRPCBaseMessage(msg)).toBe(true);
                assert(isRPCBaseMessage(msg));

                if (isRPCCancelRequest(msg)) {
                    respondWithDelay(port, createRPCError(msg.id, error, 400), 1);
                }
            }
        }
    });
});

function createPort(attach?: (port: MessagePortLike) => void): MessagePortLike {
    const { port1, port2 } = new MessageChannel();

    attach?.(port2);

    return port1;
}

function respondWithDelay<T>(port: MessagePortLike, value: T, delayMs: number = 0): void {
    setTimeout(() => port.postMessage(value), delayMs);
}

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}
