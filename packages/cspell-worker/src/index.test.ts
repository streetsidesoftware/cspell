import type { Worker } from 'node:worker_threads';

import { describe, expect, test } from 'vitest';

import { startCSpellWorker, startSimpleRPCWorker } from '../dist/index.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Index', () => {
    test('Create Simple Server', async () => {
        const { worker, client } = startSimpleRPCWorker();
        await workerOnline(worker);

        const api = client.api;
        await expect(api.add(2, 3)).resolves.toBe(5);
        await expect(api.mul(2, 3)).resolves.toBe(6);
        await expect(api.sub(2, 3)).resolves.toBe(-1);
        await expect(api.div(33, 3)).resolves.toBe(11);
        await expect(api.sleep(2)).resolves.toBe(undefined);
        await expect(api.error('My Error')).rejects.toEqual(new Error('My Error'));

        client[Symbol.dispose]();
        worker.terminate();
    });

    test('Create Simple Server', async () => {
        const { worker, client } = startCSpellWorker();
        await workerOnline(worker);

        const api = client.getApi();

        await expect(client.isOK()).resolves.toBe(true);
        const doc = { uri: import.meta.url };
        const result = await api.spellCheckDocument(doc, {}, {});
        expect(result).toBeDefined();
        expect(result).toEqual(oc({ document: oc(doc), issues: [], errors: undefined }));

        client[Symbol.dispose]();
        worker.terminate();
    });
});

function workerOnline(worker: Worker): Promise<void> {
    return new Promise((resolve) => {
        worker.once('online', () => resolve());
    });
}
