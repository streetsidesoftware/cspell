import { randomUUID } from 'node:crypto';
import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import { RPCClient } from './client.js';
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
        const { client, server, api } = createClientServerPair(getTestApi());

        expect(client).toBeDefined();
        expect(server).toBeDefined();
        expect(api).toBeDefined();

        const clientApi = client.getApi(['sleep']);

        await expect(clientApi.sleep(10)).resolves.toBe(undefined);
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
        sleep: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
        error: (message: string): void => {
            throw new Error(message);
        },
    };
}

function createClientServerPair<TApi>(api: TApi): {
    client: RPCClient<TApi>;
    server: RPCServer<TApi>;
    api: TApi;
} {
    const channel = new MessageChannel();
    const portClient = channel.port1;
    const portServer = channel.port2;
    spyOnPort(portServer);
    spyOnPort(portClient);

    const server = new RPCServer<TApi>(portServer, api);
    const client = new RPCClient<TApi>(portClient, { randomUUID });

    return { client, server, api };
}

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}
