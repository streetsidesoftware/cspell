import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test } from 'vitest';

import type { SimpleRPCClient } from './simpleServer.js';
import { startSimpleRPCClient, startSimpleServer } from './simpleServer.js';

describe('Index', () => {
    test('Create Simple Server', async () => {
        const client = startSimpleRPCWorker();

        const api = client.api;
        await expect(api.add(2, 3)).resolves.toBe(5);
        await expect(api.mul(2, 3)).resolves.toBe(6);
        await expect(api.sub(2, 3)).resolves.toBe(-1);
        await expect(api.div(33, 3)).resolves.toBe(11);
        await expect(api.sleep(2)).resolves.toBe(undefined);
        await expect(api.error('My Error')).rejects.toEqual(new Error('My Error'));

        client[Symbol.dispose]();
    });
});

export function startSimpleRPCWorker(): SimpleRPCClient {
    const messageChannel = new MessageChannel();
    const { port1, port2 } = messageChannel;
    startSimpleServer(port1);
    return startSimpleRPCClient(port2);
}
