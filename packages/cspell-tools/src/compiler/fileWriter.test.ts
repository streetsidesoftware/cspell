import { mkdir, readFile } from 'fs/promises';
import { loremIpsum } from 'lorem-ipsum';
import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { test_dirname } from '../test/TestHelper.js';
import * as fileWriter from './fileWriter.js';

const _dirname = test_dirname(import.meta.url);

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

describe('Validate the writer', () => {
    test('tests writing an Rx.Observable and reading it back.', async () => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(_dirname, '../../temp/tests-writing-an-observable.txt');

        await mkdirp(path.dirname(filename));
        await fileWriter.writeToFileIterableP(filename, data);
        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });
});
