import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import type { MessagePortLike } from './index.js';
import { CSpellRPCClient } from './index.js';
import { CSpellRPCServer } from './index.js';

const packageUrl = new URL('../../package.json', import.meta.url);

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);
const ac = (...params: Parameters<typeof expect.arrayContaining>) => expect.arrayContaining(...params);

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

        const doc = { uri: import.meta.url };
        const result = await api.spellCheckDocument(doc, {}, {});
        expect(result).toBeDefined();
        expect(result).toEqual(oc({ issues: [], errors: undefined }));

        const result2 = await api.spellCheckDocument(doc, {}, {});
        expect(result2).toBeDefined();
        expect(result2).toEqual(oc({ issues: [], errors: undefined }));
    });

    const urlFixtures = new URL('fixtures/', packageUrl);
    const urlSampleFilesWithIssues = new URL('docValidator/sample-files-with-issues/', urlFixtures);
    const noIssues = { issues: [], errors: undefined, configErrors: undefined, dictionaryErrors: undefined };

    const expectedFor = {
        'WOX_Permissions.ps1': { ...noIssues, issues: ac([oc({ text: 'explicitily' })]) }, // cspell:ignore explicitily
        'import-errors/file.txt': {
            ...noIssues,
            configErrors: [
                {
                    filename: expect.stringContaining('missing.config.yaml'),
                    error: oc({
                        message: expect.stringContaining(
                            'Failed to resolve configuration file: "./missing.config.yaml"',
                        ),
                    }),
                },
            ],
            dictionaryErrors: new Map([['my-dict', [new Error('failed to load', { cause: expect.anything() })]]]),
            errors: [
                oc({
                    message: expect.stringContaining('Failed to resolve configuration file: "./missing.config.yaml"'),
                }),
            ],
        },
    };

    test.each`
        filename                    | rootUrl                     | expected
        ${import.meta.url}          | ${import.meta.url}          | ${noIssues}
        ${'WOX_Permissions.ps1'}    | ${urlSampleFilesWithIssues} | ${expectedFor['WOX_Permissions.ps1']}
        ${'import-errors/file.txt'} | ${urlFixtures}              | ${expectedFor['import-errors/file.txt']}
    `('spell document $filename', async ({ filename, rootUrl, expected }) => {
        const { client } = createClientServerPair();
        const api = client.getApi();
        const uri = new URL(filename, rootUrl).href;

        const doc = { uri };
        const result = await api.spellCheckDocument(doc, {}, {});
        const { issues, errors, configErrors, dictionaryErrors } = result;
        expect({ issues, errors, configErrors, dictionaryErrors }).toEqual(expected);
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
