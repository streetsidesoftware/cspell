import { randomUUID } from 'node:crypto';
import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import { assert } from './assert.js';
import { RPCClient } from './client.js';
import { AbortRPCRequestError, CanceledRPCRequestError, TimeoutRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import { RPCServer } from './server.js';

describe('Validate Client / Server communications', () => {
    test('Simple API', async () => {
        const { client, server, api } = createClientServerPair(getTestApi());

        expect(client).toBeDefined();
        expect(server).toBeDefined();
        expect(api).toBeDefined();

        const clientApi = client.getApi(['add', 'sub', 'mul', 'div']);

        await expect(clientApi.add(10, 5)).resolves.toBe(15);
        await expect(clientApi.sub(10, 5)).resolves.toBe(5);
        await expect(clientApi.mul(10, 5)).resolves.toBe(50);
        await expect(clientApi.div(10, 5)).resolves.toBe(2);

        await expect(client.isOK()).resolves.toBe(true);
    });

    test('Simple API sleep', async () => {
        const { client } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep']);
        await expect(clientApi.sleep(10)).resolves.toBe(undefined);
        await expect(client.call('sleep', [10_000], { timeoutMs: 10 })).rejects.toThrow(TimeoutRPCRequestError);

        const longSleep = clientApi.sleep(10_000);

        const request = client.getPendingRequestByPromise(longSleep);
        expect(request).toBeDefined();
        expect(request?.isCanceled).toBe(false);

        await expect(client.cancelPromise(longSleep)).resolves.toBe(true);

        expect(request?.isCanceled).toBe(true);

        // Make sure the request is removed after cancellation
        expect(client.getPendingRequestByPromise(longSleep)).toBeUndefined();

        await expect(longSleep).rejects.toThrow(CanceledRPCRequestError);
    });

    test('Using a default client timeout', async () => {
        const { client } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep']);
        client.setTimeout(10);
        await expect(clientApi.sleep(10_000)).rejects.toThrow(TimeoutRPCRequestError);
    });

    test('Shutdown server with pending requests', async () => {
        const { client, server } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep']);

        const longSleep = clientApi.sleep(10_000);
        await expect(clientApi.sleep(1)).resolves.toBe(undefined);
        server[Symbol.dispose]();
        await expect(longSleep).rejects.toThrow(new Error('RPC Server is shutting down'));
    });

    test('Stop client with pending requests', async () => {
        const { client } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep']);

        const longSleep = clientApi.sleep(10_000);
        await expect(clientApi.sleep(1)).resolves.toBe(undefined);
        client[Symbol.dispose]();
        await expect(longSleep).rejects.toThrow(new Error('RPC Client disposed'));
    });

    test('Send malformed messages to the client', async () => {
        const { client, portClient } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep', 'add']);

        const longSleep = clientApi.sleep(10_000);
        await expect(clientApi.sleep(1)).resolves.toBe(undefined);

        portClient.postMessage('Hello World');
        portClient.postMessage({ sig: 'RPC0', id: 1, type: 'response' }); // Missing code and result
        portClient.postMessage({ sig: 'RPC0', id: 2, type: 'response', code: 200 }); // Missing result

        const request = client.getPendingRequestByPromise(longSleep);
        assert(request);

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(false);

        portClient.postMessage({ sig: 'RPC0', id: request.id, type: 'response' });

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(false);

        await expect(clientApi.add(1, 2)).resolves.toBe(3);

        request.abort('Test abort after malformed messages');
        request.abort('Double abort.');

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(true);

        client.abortPromise(longSleep, 'Abort again.');

        client[Symbol.dispose]();
        await expect(longSleep).rejects.toThrow(new AbortRPCRequestError('Test abort after malformed messages'));
    });

    test('Requests after Server Shutdown', async () => {
        const { client, server } = createClientServerPair(getTestApi());
        const clientApi = client.getApi(['sleep']);
        await expect(clientApi.sleep(1)).resolves.toBe(undefined);
        server[Symbol.dispose]();

        await expect(client.isOK()).resolves.toBe(false);
    });

    test('the request resolved', async () => {
        const { client } = createClientServerPair(getTestApi());

        const request = client.request('add', [1, 2], { timeoutMs: 100 });

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(false);

        await expect(request.response).resolves.toBe(3);

        expect(request.isResolved).toBe(true);
        expect(request.isCanceled).toBe(false);

        await expect(request.cancel()).resolves.toBe(false);

        // Make sure we cannot cancel a resolved request
        expect(request.isResolved).toBe(true);
        expect(request.isCanceled).toBe(false);

        // try to cancel by promise
        await expect(client.cancelPromise(request.response)).resolves.toBe(false);

        await expect(client.cancelRequest(request.id)).resolves.toBe(false);

        // try to cancel a random promise
        await expect(client.cancelPromise(Promise.resolve(42))).resolves.toBe(false);
    });

    test('the request canceled', async () => {
        const { client } = createClientServerPair(getTestApi());

        const request = client.request('sleep', [10_000], { timeoutMs: 10 });

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(false);

        await expect(request.response).rejects.toThrow(TimeoutRPCRequestError);

        expect(request.isResolved).toBe(false);
        expect(request.isCanceled).toBe(true);
    });
});

interface TestApi {
    add(a: number, b: number): number;
    sub(a: number, b: number): number;
    mul(a: number, b: number): number;
    div(a: number, b: number): number;
    sleep(ms: number): Promise<void>;
    error(message: string): void;
}

function getTestApi(): TestApi {
    return {
        add: (a: number, b: number): number => a + b,
        sub: (a: number, b: number): number => a - b,
        mul: (a: number, b: number): number => a * b,
        div: (a: number, b: number): number => a / b,
        sleep: wait,
        error: (message: string): void => {
            throw new Error(message);
        },
    };
}

interface ClientServerPair<TApi> {
    client: RPCClient<TApi>;
    server: RPCServer<TApi>;
    api: TApi;
    portClient: MessagePortLike;
    portServer: MessagePortLike;
}

function createClientServerPair<TApi>(api: TApi): ClientServerPair<TApi> {
    const channel = new MessageChannel();
    const portClient = channel.port1;
    const portServer = channel.port2;
    spyOnPort(portServer);
    spyOnPort(portClient);

    const server = new RPCServer<TApi>(portServer, api);
    const client = new RPCClient<TApi>(portClient, { randomUUID });

    return { client, server, api, portClient, portServer };
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
