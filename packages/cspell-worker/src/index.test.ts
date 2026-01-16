import { describe, expect, test } from 'vitest';

import { startCSpellWorker } from '../dist/index.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Index', () => {
    test('Create CSpell Server', async () => {
        await using worker = startCSpellWorker();
        await worker.ready;
        const client = worker.client;

        await expect(worker.ok(1000)).resolves.toBe(true);
        await expect(client.isOK()).resolves.toBe(true);

        const status = worker.status;
        expect(status.size).toBeGreaterThan(0);
        expect([...status.keys()]).toEqual([
            'status:starting',
            'status:server:starting',
            'status:server:ready',
            'status:ready',
            'status:ok',
        ]);
    });

    test('Spell check a document.', async () => {
        await using worker = startCSpellWorker();
        await worker.ready;
        const client = worker.client;

        await expect(worker.ok(1000)).resolves.toBe(true);

        await expect(client.isOK()).resolves.toBe(true);

        const api = client.getApi();

        const doc = { uri: import.meta.url };
        const result = await api.spellCheckDocument(doc, {}, {});
        expect(result).toBeDefined();
        expect(result).toEqual(oc({ document: oc(doc), issues: [], errors: undefined }));
    });
});
