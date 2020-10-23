import { testing, LoadOptions, loadDictionary } from './DictionaryLoader';
import * as path from 'path';
jest.mock('../util/logger');


const root = path.join(__dirname, '..', '..');
const samples = path.join(root, 'samples');

describe('Validate DictionaryLoader', () => {
    it('test not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, Object][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', { }, unknownFormatError],
            ['./notfound.trie.gz', { }, unknownFormatError],
        ];

        for (const t of tests) {
            const dictionary = testing.load(t[0], t[1]);
            await expect(dictionary).rejects.toEqual(expect.objectContaining(t[2]));
        }
    });

    it('test not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, Object][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', { }, unknownFormatError],
            ['./notfound.trie.gz', { }, unknownFormatError],
        ];

        for (const t of tests) {
            const entry = testing.loadEntry(t[0], t[1]);

            await expect(entry.state).resolves.toBe(undefined);
            await expect(entry.dictionary).resolves.not.toBe(undefined);
        }
    });

    it('loadDictionary not found', async () => {
        const error = { code: 'ENOENT' };
        const unknownFormatError = new Error('Unknown file format');
        const tests: [string, LoadOptions, Object][] = [
            ['./notfound.txt', {}, error],
            ['./notfound.txt', { type: 'S' }, error],
            ['./notfound.txt', { type: 'C' }, error],
            ['./notfound.txt.gz', {}, error],
            ['./notfound.txt.gz', { type: 'S' }, error],
            ['./notfound.txt.gz', { type: 'C' }, error],
            ['./notfound.trie', { }, unknownFormatError],
            ['./notfound.trie.gz', { }, unknownFormatError],
        ];

        for (const t of tests) {
            const pDict = loadDictionary(t[0], t[1]);
            await expect(pDict).resolves.not.toBe(undefined);
        }
    });

    it('loadDictionary', async () => {
        const tests: [string, LoadOptions, string][] = [
            [sample('words.txt'), {}, 'apple'],
            [sample('words.txt'), { type: 'S' }, 'pear'],
            [sample('words.txt'), { type: 'C' }, 'strawberry'],
            ['node_modules/cspell-dict-csharp/csharp.txt.gz', {}, 'const'],
            ['node_modules/cspell-dict-csharp/csharp.txt.gz', { type: 'S' }, 'const'],
            ['node_modules/cspell-dict-csharp/csharp.txt.gz', { type: 'C' }, 'const'],
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
