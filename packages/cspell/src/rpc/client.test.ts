import assert from 'node:assert';
import { randomUUID } from 'node:crypto';

import { describe, expect, test, vi } from 'vitest';

import { RPCClient } from './client.js';
import { AbortRequestError } from './errors.js';
import {
    createRPCError,
    createRPCResponse,
    isRPCBaseMessage,
    isRPCCancel,
    isRPCRequest,
    type MessagePortLike,
} from './models.js';

describe('RPC Client', () => {
    test('new RPCClient', () => {
        const mockPort = createMockPort();
        const client = new RPCClient<any>(mockPort);
        expect(client).toBeDefined();
        expect(mockPort.onmessage).toBeDefined();

        expect(mockPort[Symbol.dispose]).toBeDefined();
        expect(mockPort[Symbol.dispose]).toBeInstanceOf(Function);
        expect(mockPort[Symbol.dispose]).toHaveBeenCalledTimes(0);
        client[Symbol.dispose]();
        expect(mockPort[Symbol.dispose]).toHaveBeenCalledTimes(1);
    });

    test('sending and receiving a response', async () => {
        const serverApi = {
            sum: (a: number, b: number): number => a + b,
            mul: (a: number, b: number): number => a * b,
        } as const;

        type ServerApi = typeof serverApi;

        const mockPort = createMockPort(vi.fn(handleMessage));

        const client = new RPCClient<ServerApi>(mockPort);

        expect(client).toBeDefined();
        assert(mockPort.onmessage);

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
                const response = createRPCResponse(msg.id, result);
                respondWithDelay(mockPort, response, 1);
            }
        }
    });

    test('error response', async () => {
        const serverApi = {
            sum: (a: number, b: number): number => a + b,
            mul: (a: number, b: number): number => a * b,
        } as const;

        type ServerApi = typeof serverApi & { div: (a: number, b: number) => number };

        const mockPort = createMockPort(vi.fn(handleMessage));

        const client = new RPCClient<ServerApi>(mockPort, { randomUUID });
        expect(client).toBeDefined();
        assert(mockPort.onmessage);

        const error = new Error('Method not found');

        await expect(client.call('sum', [2, 3])).resolves.toBe(5);

        await expect(client.call('div', [4, 2])).rejects.toThrowError(error);

        function isKeyOfServerApi(key: string): key is keyof ServerApi {
            return key in serverApi;
        }

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
                const response = createRPCResponse(msg.id, result);
                respondWithDelay(mockPort, response, 1);
                return;
            }

            respondWithDelay(mockPort, createRPCError(msg.id, error), 1);
        }
    });

    test('abort request', async () => {
        interface ServerApi {
            sum: (a: number, b: number) => number;
            mul: (a: number, b: number) => number;
        }

        const mockPort = createMockPort(vi.fn(handleMessage));

        const client = new RPCClient<ServerApi>(mockPort, { randomUUID });

        expect(client).toBeDefined();
        assert(mockPort.onmessage);

        const error = new Error('Error canceled by client');

        const request = client.request('sum', [2, 3]);
        const p = expect(request.response).rejects.toThrowError(
            new AbortRequestError('Client is aborting the request'),
        );
        request.abort('Client is aborting the request');
        await p;

        expect(mockPort.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'cancel' }));

        function handleMessage(msg: unknown) {
            expect(msg).toBeDefined();
            expect(isRPCBaseMessage(msg)).toBe(true);
            assert(isRPCBaseMessage(msg));

            if (isRPCCancel(msg)) {
                respondWithDelay(mockPort, createRPCError(msg.id, error), 1);
            }
        }
    });

    test('abort request promise', async () => {
        interface ServerApi {
            sum: (a: number, b: number) => number;
            mul: (a: number, b: number) => number;
        }

        const mockPort = createMockPort(vi.fn(handleMessage));

        const client = new RPCClient<ServerApi>(mockPort, { randomUUID });

        expect(client).toBeDefined();
        assert(mockPort.onmessage);

        const error = new Error('Error canceled by client');
        const errorAbort = new Error('Error aborted by client');

        const pResult = client.call('sum', [2, 3]);
        const p = expect(pResult).rejects.toThrowError(errorAbort);

        client.abortPromise(pResult, errorAbort);

        await p;

        function handleMessage(msg: unknown) {
            expect(msg).toBeDefined();
            expect(isRPCBaseMessage(msg)).toBe(true);
            assert(isRPCBaseMessage(msg));

            if (isRPCCancel(msg)) {
                respondWithDelay(mockPort, createRPCError(msg.id, error), 1);
            }
        }
    });
});

function createMockPort(postMessageImpl = vi.fn()): MessagePortLike {
    return {
        onmessage: undefined,
        onmessageerror: undefined,
        postMessage: postMessageImpl,
        [Symbol.dispose]: vi.fn(),
    };
}

function respondWithDelay<T>(port: MessagePortLike, value: T, delayMs: number = 0): void {
    setTimeout(() => port.onmessage?.(value), delayMs);
}
