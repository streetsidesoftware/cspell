import { loremIpsum } from 'lorem-ipsum';
import { describe, expect, test } from 'vitest';

import { makePathToFile, pathToTemp } from '../../test/test.helper.js';
import { readFile } from './fileReader.js';
import * as fileWriter from './fileWriter.js';

describe('Validate the writer', () => {
    test.each`
        baseFilename
        ${'tests-writing-an-observable.txt'}
        ${'tests-writing-an-observable.txt.gz'}
    `('writeToFileIterableP - writing data and reading it back: $baseFilename', async ({ baseFilename }) => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = pathToTemp(baseFilename);
        await makePathToFile(filename);

        await fileWriter.writeToFile(filename, data);
        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });

    test.each`
        baseFilename
        ${'tests-writing.txt'}
        ${'tests-writing.txt.gz'}
    `('writeToFile: $baseFilename', async ({ baseFilename }) => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const filename = pathToTemp(baseFilename);
        await makePathToFile(filename);
        await fileWriter.writeToFile(filename, text);

        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });
});
