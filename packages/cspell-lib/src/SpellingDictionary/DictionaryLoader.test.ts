import { LoadOptions } from './DictionaryLoaderTypes';
import { testing, loadDictionary, refreshCacheEntries } from './DictionaryLoader';
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

    const csharp = require.resolve('@cspell/dict-csharp/csharp.txt.gz');
    test.each`
        testCase            | file                          | options          | word            | maxAge       | hasWord  | hasErrors
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'apple'}      | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 5 }}   | ${'apple'}      | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'S' }} | ${'pear'}       | ${undefined} | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'strawberry'} | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'tree'}       | ${1}         | ${false} | ${false}
        ${'unknown loader'} | ${sample('words.txt')}        | ${{ type: 5 }}   | ${'apple'}      | ${1}         | ${true}  | ${false}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{}}            | ${'apple'}      | ${1}         | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{ type: 'S' }} | ${'pear'}       | ${undefined} | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{ type: 'C' }} | ${'strawberry'} | ${1}         | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{}}            | ${'tree'}       | ${1}         | ${false} | ${true}
        ${'csharp type {}'} | ${csharp}                     | ${{}}            | ${'const'}      | ${1}         | ${true}  | ${false}
        ${'csharp type S'}  | ${csharp}                     | ${{ type: 'S' }} | ${'const'}      | ${1}         | ${true}  | ${false}
        ${'csharp type C'}  | ${csharp}                     | ${{ type: 'C' }} | ${'const'}      | ${1}         | ${true}  | ${false}
    `(
        '$testCase $word',
        async ({
            file,
            options,
            word,
            maxAge,
            hasWord,
            hasErrors,
        }: {
            file: string;
            options: LoadOptions;
            word: string;
            maxAge: number | undefined;
            hasWord: boolean;
            hasErrors: boolean;
        }) => {
            await refreshCacheEntries(maxAge, Date.now());
            const d = await loadDictionary(file, options);
            expect(d.has(word)).toBe(hasWord);
            expect(!!d.getErrors?.().length).toBe(hasErrors);
        }
    );
});

function sample(file: string): string {
    return path.join(samples, file);
}
