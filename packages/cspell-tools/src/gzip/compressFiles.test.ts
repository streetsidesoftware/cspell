import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

import { describe, expect, test, vi } from 'vitest';

import { compressFile } from './compressFiles.js';

const content = `
Have a nice day.
`;

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn().mockImplementation(() => Promise.resolve(Buffer.from(content))),
    writeFile: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
}));

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

describe('compressFiles', () => {
    test('compressFile', async () => {
        await compressFile('README.md');
        expect(mockReadFile).toHaveBeenLastCalledWith('README.md');
        expect(mockWriteFile).toHaveBeenLastCalledWith('README.md.gz', gzipSync(content));
    });
});
