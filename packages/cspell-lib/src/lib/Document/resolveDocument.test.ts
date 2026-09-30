import fs from 'node:fs/promises';

import { createRedirectProvider } from 'cspell-io';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { pathPackageSamplesURL } from '../../test-util/index.mjs';
import { getVirtualFS } from '../fileSystem.js';
import { resolveDocument } from './resolveDocument.js';

const remoteRoot = new URL('vscode-vfs://github/owner/repo/');

describe('resolveDocument', () => {
    let dispose: (() => void) | undefined;

    beforeAll(() => {
        const provider = createRedirectProvider('remote-test', remoteRoot, pathPackageSamplesURL);
        dispose = getVirtualFS().registerFileSystemProvider(provider).dispose;
    });

    afterAll(() => dispose?.());

    test('returns the text when it is given', async () => {
        const doc = { uri: 'stdin:///', text: 'some text' };
        await expect(resolveDocument(doc)).resolves.toBe(doc);
    });

    test.each`
        file
        ${'README.md'}
        ${'Dutch.txt'}
    `('reads a remote document $file through the virtual file system', async ({ file }) => {
        const uri = new URL(file, remoteRoot).href;
        const expected = await fs.readFile(new URL(file, pathPackageSamplesURL), 'utf8');
        await expect(resolveDocument({ uri })).resolves.toEqual({ uri, text: expected });
    });

    test('rejects a remote document that is not found', async () => {
        const uri = new URL('not-found.md', remoteRoot).href;
        await expect(resolveDocument({ uri })).rejects.toThrow();
    });

    test('does not read stdin', () => {
        expect(() => resolveDocument({ uri: 'stdin:///' })).toThrow('Unsupported schema: "stdin", open "stdin:///"');
    });
});
