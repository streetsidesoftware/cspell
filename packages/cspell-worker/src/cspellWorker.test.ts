import { TimeoutRPCRequestError } from 'cspell-lib/rpc';
import { describe, expect, test } from 'vitest';

import { startCSpellWorker } from '../dist/index.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Index', () => {
    test('Create CSpell Server', async () => {
        await using worker = startCSpellWorker();
        // expect worker to not be ready immediately.
        expect(worker.isReadyNow).toBe(false);
        await expect(worker.client.ready({ timeoutMs: 1 })).rejects.toThrowError(TimeoutRPCRequestError);
        await worker.ready;
        expect(worker.isReadyNow).toBe(true);
        await expect(worker.client.ready({ timeoutMs: 1 })).resolves.toBe(true);
        expect(worker.numberOfPendingRequests).toBe(0);
        const client = worker.client;
        await expect(worker.ok()).resolves.toBe(true);
        await expect(client.isOK()).resolves.toBe(true);

        await expect(client.getApi().echo('hello')).resolves.toBe('hello');
    });

    test('Spell check a document.', async () => {
        await using worker = startCSpellWorker();
        await worker.ready;
        const client = worker.client;

        await expect(worker.ok(1000)).resolves.toBe(true);

        await expect(client.isOK()).resolves.toBe(true);

        const api = client.getApi();

        const doc = { uri: import.meta.url };
        expect(worker.numberOfPendingRequests).toBe(0);
        const pending = api.spellCheckDocument(doc, {}, {});
        expect(worker.numberOfPendingRequests).toBe(1);
        const result = await pending;
        expect(result).toBeDefined();
        expect(result).toEqual(oc({ document: oc(doc), issues: [], errors: undefined }));
    });
});
