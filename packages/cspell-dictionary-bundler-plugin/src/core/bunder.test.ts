import fs from 'node:fs/promises';

import type { CSpellVFS } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { makeVfsUrl, populateVfs } from './bundler.ts';

const fixturesUrl = new URL('../../tests/fixtures/file.txt', import.meta.url);

describe('makeVfsUrl', () => {
    test.each`
        url                                                        | hash        | expected
        ${'file:///to/file.txt'}                                   | ${'abc123'} | ${'cspell-vfs:///abc123/to/file.txt'}
        ${'file:///path/to/file.txt'}                              | ${'abc123'} | ${'cspell-vfs:///abc123/path/to/file.txt'}
        ${'file:///one/two/three/path/to/file.txt'}                | ${'abc123'} | ${'cspell-vfs:///abc123/path/to/file.txt'}
        ${'file:///path/to/node_modules/@cspell/dict-en/file.txt'} | ${'abc123'} | ${'cspell-vfs:///abc123/@cspell/dict-en/file.txt'}
    `('should create a vfs url $url $hash', ({ url, hash, expected }) => {
        url = new URL(url);
        const vfsUrl = makeVfsUrl(url, hash);
        expect(vfsUrl.href).toBe(expected);
    });
});

describe('populateVfs', () => {
    test('should populate the vfs with the content of the file', async () => {
        const vfs: CSpellVFS = {};
        const fileUrl = new URL('words.txt', fixturesUrl);
        const url = await populateVfs(vfs, fileUrl);
        expect(url.href).toMatch(/^cspell-vfs:\/\/\//);
        expect(vfs[url.href]).toBeDefined();
        expect(vfs[url.href].encoding).toBe('base64');
        const content = Buffer.from(vfs[url.href].data as string, 'base64').toString();
        expect(content).toBe(await fs.readFile(fileUrl, 'utf8'));
    });
});
