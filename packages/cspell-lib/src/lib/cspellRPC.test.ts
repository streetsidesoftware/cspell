import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import type { MessagePortLike } from './cspellRPC.js';
import { CSpellRPCClient, CSpellRPCServer } from './cspellRPC.js';

describe('Validate Client / Server communications', () => {
    test('Check creation', async () => {
        const { client, server, portClient, portServer } = createClientServerPair();

        expect(client).toBeDefined();
        expect(server).toBeDefined();

        expect(portClient.addListener).toHaveBeenCalled();
        expect(portServer.addListener).toHaveBeenCalled();
    });

    test('spell checking a document.', async () => {
        const { client } = createClientServerPair();

        const api = client.getApi();
        expect(api).toBeDefined();
        expect(api.spellCheckDocument).toBeDefined();

        // const doc = { uri: import.meta.url };
        // const result = await api.spellCheckDocument(doc, {}, {});
        // expect(result).toBeDefined();
        // expect(result).toEqual({});
    });
});

interface ClientServerPair {
    client: CSpellRPCClient;
    server: CSpellRPCServer;
    portClient: MessagePortLike;
    portServer: MessagePortLike;
}

function createClientServerPair(): ClientServerPair {
    const channel = new MessageChannel();
    const portClient = channel.port1;
    const portServer = channel.port2;
    spyOnPort(portServer);
    spyOnPort(portClient);

    const server = new CSpellRPCServer(portServer);
    const client = new CSpellRPCClient(portClient);

    return { client, server, portClient, portServer };
}

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}
