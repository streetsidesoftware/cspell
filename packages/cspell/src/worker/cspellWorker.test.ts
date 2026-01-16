import { describe, expect, test } from 'vitest';

import { startCSpellWorker } from './cspellWorker.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Validate CSpellWorker', () => {
    test('Check creation', async () => {
        await using worker = startCSpellWorker();

        expect(worker).toBeDefined();
        await worker.ready;
        await expect(worker.ok(1000)).resolves.toBe(true);
    });

    test('spell checking a document.', async () => {
        await using worker = startCSpellWorker();
        expect(worker).toBeDefined();
        await worker.ready;

        const api = worker.client.getApi();
        expect(api).toBeDefined();
        expect(api.spellCheckDocument).toBeDefined();

        const client = worker.client;

        await expect(worker.ok(1000)).resolves.toBe(true);

        const t = performance.now();
        await expect(client.isOK()).resolves.toBe(true);
        console.log(`isOK time: ${performance.now() - t} ms`);

        const urls = [import.meta.url, 'cspellWorker.ts', 'index.ts'];

        for (const url of urls) {
            const uri = new URL(url, import.meta.url).href;
            const doc = { uri };
            const t = performance.now();
            const result = await api.spellCheckDocument(doc, {}, {});
            console.log(`check time: ${performance.now() - t} ms`);
            expect(result).toBeDefined();
            expect(result).toEqual(oc({ document: oc({ uri }), issues: [], errors: undefined }));
        }
    });
});

// function wait(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
