import { testing, LoadOptions, loadDictionary } from './DictionaryLoader';
import * as path from 'path';
jest.mock('../util/logger');

const root = path.join(__dirname, '..', '..');
const samples = path.join(root, 'samples');

type ErrorResults = Record<string, unknown> | Error;

describe('Validate DictionaryLoader', () => {
    it('load not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, ErrorResults][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', {}, unknownFormatError],
            ['./notfound.trie.gz', {}, unknownFormatError],
        ];

        for (const t of tests) {
            const dictionary = testing.load(t[0], t[1]);
            await expect(dictionary).rejects.toEqual(expect.objectContaining(t[2]));
        }
    });

    it('loadEntry not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, ErrorResults][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', {}, unknownFormatError],
            ['./notfound.trie.gz', {}, unknownFormatError],
        ];

        for (const t of tests) {
            const entry = testing.loadEntry(t[0], t[1]);

            await expect(entry.state).resolves.toEqual(expect.objectContaining(error));
            await expect(entry.dictionary).resolves.not.toBe(undefined);
        }
    });

    it('loadDictionary not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, ErrorResults][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', {}, unknownFormatError],
            ['./notfound.trie.gz', {}, unknownFormatError],
        ];

        for (const t of tests) {
            const pDict = loadDictionary(t[0], t[1]);
            await expect(pDict).resolves.not.toBe(undefined);
        }
    });

    it('loadDictionary', async () => {
        const csharp = require.resolve('@cspell/dict-csharp/csharp.txt.gz');
        const tests: [string, LoadOptions, string][] = [
            [sample('words.txt'), {}, 'apple'],
            [sample('words.txt'), { type: 'S' }, 'pear'],
            [sample('words.txt'), { type: 'C' }, 'strawberry'],
            [csharp, {}, 'const'],
            [csharp, { type: 'S' }, 'const'],
            [csharp, { type: 'C' }, 'const'],
        ];

        for (const t of tests) {
            const d = await loadDictionary(t[0], t[1]);
            expect(d.has(t[2])).toBe(true);
        }
    });
});

function sample(file: string): string {
    return path.join(samples, file);
}
