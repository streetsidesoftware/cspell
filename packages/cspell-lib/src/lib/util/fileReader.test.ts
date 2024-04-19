import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import * as fileReader from './fileReader.js';

const __filename = fileURLToPath(import.meta.url);

describe('Validate file reader', () => {
    test('Catches errors for non-existent files', async () => {
        await expect(fileReader.readLines('./non-existent.txt')).rejects.toThrowError(
            'ENOENT: no such file or directory',
        );
    });

    test.each`
        file
        ${__filename}
    `('reading files "$file"', async ({ file: filename }) => {
        const expected = (await fs.readFile(filename, 'utf8')).split(/\r?\n/g);
        const content = [...(await fileReader.readLines(filename))];
        expect(content).toEqual(expected);
    });
});
