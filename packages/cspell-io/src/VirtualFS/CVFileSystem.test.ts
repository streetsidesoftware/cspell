import { describe, expect, test } from 'vitest';

import { CVFileSystem } from './CVFileSystem.js';
import { getDefaultVFileSystemCore } from './CVirtualFS.js';

describe('CVFileSystem', () => {
    test('CVFileSystem', () => {
        const vfs = new CVFileSystem(getDefaultVFileSystemCore());
        expect(vfs).toBeDefined();
        expect(vfs.findUp).toBeInstanceOf(Function);
    });

    test('findUp', async () => {
        const vfs = new CVFileSystem(getDefaultVFileSystemCore());
        const result = await vfs.findUp('README.md', new URL(import.meta.url));
        expect(result?.href).toEqual(expect.stringContaining('cspell-io/README.md'));
    });
});
