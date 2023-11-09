import { promises as fs } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { getStat, getStatSync, readFileText, readFileTextSync } from './file.js';

describe('file', () => {
    test('readFileText', async () => {
        const content = await fs.readFile(new URL(import.meta.url), 'utf8');
        const text = await readFileText(import.meta.url);
        expect(text).toBe(content);
    });

    test('readFileTextSync', async () => {
        const content = await fs.readFile(new URL(import.meta.url), 'utf8');
        const text = readFileTextSync(import.meta.url);
        expect(text).toBe(content);
    });

    test('getStat', async () => {
        const stat = await getStat(import.meta.url);
        expect(stat).toEqual(expect.objectContaining({ size: expect.any(Number) }));
    });

    test('getStat with error', async () => {
        const stat = await getStat(import.meta.url + '/not-found');
        expect(stat).toEqual(expect.any(Error));
    });

    test('getStatSync', () => {
        const stat = getStatSync(import.meta.url);
        expect(stat).toEqual(expect.objectContaining({ size: expect.any(Number) }));
    });

    test('getStatSync with error', () => {
        const stat = getStatSync(import.meta.url + '/not-found');
        expect(stat).toEqual(expect.any(Error));
    });
});
