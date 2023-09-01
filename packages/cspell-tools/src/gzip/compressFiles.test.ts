import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

import { describe, expect, test, vi } from 'vitest';

import { compress, compressFile, decompress, OSFlags } from './compressFiles.js';

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

    test('compress/decompress string', async () => {
        const gzBufA = await compress(content);
        const gzBufB = await compress(content, OSFlags.NTFS);
        const gzBufC = await compress(content, OSFlags.Unix);

        expect(gzBufB).not.toEqual(gzBufC);

        const strA = await decompress(gzBufA, 'utf8');
        const strB = await decompress(gzBufB, 'utf8');
        const strC = await decompress(gzBufC, 'utf8');

        expect(strA).toEqual(content);
        expect(strB).toEqual(content);
        expect(strC).toEqual(content);

        const bufA = await decompress(gzBufA);
        const bufB = await decompress(gzBufB);
        const bufC = await decompress(gzBufC);

        const contentBuf = Buffer.from(content);

        expect(bufA).toEqual(contentBuf);
        expect(bufB).toEqual(contentBuf);
        expect(bufC).toEqual(contentBuf);
    });
});
