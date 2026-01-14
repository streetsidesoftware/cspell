import { describe, expect, test } from 'vitest';

import { CSpellWorker } from './cspellWorker.js';

describe('Validate CSpellWorker', () => {
    test('Check creation', async () => {
        const worker = new CSpellWorker();

        expect(worker).toBeDefined();
    });

    test('spell checking a document.', async () => {
        const worker = new CSpellWorker();

        expect(worker).toBeDefined();

        const api = worker.api;
        expect(api).toBeDefined();
        expect(api.spellCheckDocument).toBeDefined();

        // const doc = { uri: import.meta.url };
        // const result = await api.spellCheckDocument(doc, {}, {});
        // expect(result).toBeDefined();
        // expect(result).toEqual({});
    });
});
