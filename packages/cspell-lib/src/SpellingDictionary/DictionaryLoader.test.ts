import { testing, loadDictionary, refreshCacheEntries, LoadOptions } from './DictionaryLoader';
import * as path from 'path';
jest.mock('../util/logger');

const root = path.join(__dirname, '..', '..');
const samples = path.join(root, 'samples');

type ErrorResults = Record<string, unknown> | Error;

describe('Validate DictionaryLoader', () => {
    const errorENOENT = { code: 'ENOENT' };
    const unknownFormatError = new Error('Unknown file format');

    interface TestLoadEntryNotFound {
        filename: string;
        expectedError: ErrorResults;
    }

    test.each`
        filename                | expectedError
        ${'./notfound.txt'}     | ${errorENOENT}
        ${'./notfound.txt.gz'}  | ${errorENOENT}
        ${'./notfound.trie'}    | ${unknownFormatError}
        ${'./notfound.trie.gz'} | ${unknownFormatError}
    `('load not found $filename', async ({ filename, expectedError }: TestLoadEntryNotFound) => {
        const def: LoadOptions = {
            path: filename,
            name: filename,
        };
        const dictionary = testing.load(filename, def);
        await expect(dictionary).rejects.toEqual(expect.objectContaining(expectedError));
    });

    test.each`
        filename                | expectedError
        ${'./notfound.txt'}     | ${errorENOENT}
        ${'./notfound.txt.gz'}  | ${errorENOENT}
        ${'./notfound.trie'}    | ${unknownFormatError}
        ${'./notfound.trie.gz'} | ${unknownFormatError}
    `('loadEntry not found $filename', async ({ filename, expectedError }: TestLoadEntryNotFound) => {
        const def: LoadOptions = {
            path: filename,
            name: filename,
        };
        const entry = testing.loadEntry(filename, def);

        await expect(entry.state).resolves.toEqual(expect.objectContaining(expectedError));
        await expect(entry.dictionary).resolves.not.toBe(undefined);
    });

    test.each`
        filename
        ${'./notfound.txt'}
        ${'./notfound.txt.gz'}
        ${'./notfound.trie'}
        ${'./notfound.trie.gz'}
    `('loadDictionary not found $filename', async ({ filename }: { filename: string }) => {
        const def: LoadOptions = {
            path: filename,
            name: filename,
        };
        const dict = await loadDictionary(filename, def);
        expect(dict.getErrors?.()).toHaveLength(1);
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
