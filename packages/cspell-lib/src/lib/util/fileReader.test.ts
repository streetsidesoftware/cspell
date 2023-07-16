import { promises as fs } from 'fs';
import { describe, expect, test } from 'vitest';

import * as fileReader from './fileReader.js';

describe('Validate file reader', () => {
    test('Catches errors for non-existent files', () => {
        return fileReader.readLines('./non-existent.txt').then(
            () => {
                expect(true).toBe(false);
                return;
            },
            (error) => {
                expect(error.toString()).toEqual(expect.stringContaining('Error: ENOENT: no such file or directory'));
                return true; // convert the error into a success.
            },
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

    test.each`
        file
        ${__filename}
    `('reading files sync "$file"', async ({ file: filename }) => {
        const expected = (await fs.readFile(filename, 'utf-8')).split(/\r?\n/g);
        const content = fileReader.readLinesSync(filename);
        expect(content).toEqual(expected);
    });
});
