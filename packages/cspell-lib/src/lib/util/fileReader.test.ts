import { promises as fs } from 'fs';
import { describe, expect, test } from 'vitest';

import * as fileReader from './fileReader.js';

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
        const expected = (await fs.readFile(filename, 'utf-8')).split(/\r?\n/g);
        const content = [...(await fileReader.readLines(filename))];
        expect(content).toEqual(expected);
    });
});
