import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test, vi } from 'vitest';

import { pathPackageRoot } from '../../../test-util/test.locations.js';
import { getFileSystem } from '../../fileSystem.js';
import type {
    DictionaryDefinitionInlineInternal,
    DictionaryDefinitionInternal,
    DictionaryFileDefinitionInternal,
} from '../../Settings/index.js';
import { mapDictDefToInternal } from '../../Settings/index.js';
import { clean } from '../../util/util.js';
import type { LoadOptions } from './DictionaryLoader.js';
import { DictionaryLoader } from './DictionaryLoader.js';
vi.mock('../../util/logger');

const __filename = fileURLToPath(import.meta.url);

const root = pathPackageRoot;
const samples = path.join(root, 'samples');

type ErrorResults = Record<string, unknown> | Error;

const di = mapDictDefToInternal;

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Validate DictionaryLoader', () => {
    const errorENOENT = { code: 'ENOENT' };
    const unknownFormatError = new Error('Unknown file format');

    const dictionaryLoader = new DictionaryLoader(getFileSystem());

    interface TestLoadEntryNotFound {
        filename: string;
        expectedError: ErrorResults;
    }

    test.each`
        filename                | expectedError
        ${'./notfound.txt'}     | ${oc({ message: 'failed to load', cause: oc(errorENOENT) })}
        ${'./notfound.txt.gz'}  | ${oc({ message: 'failed to load', cause: oc(errorENOENT) })}
        ${'./notfound.trie'}    | ${oc({ message: 'failed to load', cause: oc(unknownFormatError) })}
        ${'./notfound.trie.gz'} | ${oc({ message: 'failed to load', cause: oc(unknownFormatError) })}
    `('load not found $filename', async ({ filename, expectedError }: TestLoadEntryNotFound) => {
        const def: LoadOptions = dDef({
            path: filename,
            name: filename,
        });
        const dictionary = await dictionaryLoader.loadDictionary(def);
        const errors = dictionary.getErrors?.();
        expect(errors).toEqual([expectedError]);
    });

    test.each`
        filename
        ${'./notfound.txt'}
        ${'./notfound.txt.gz'}
        ${'./notfound.trie'}
        ${'./notfound.trie.gz'}
    `('loadDictionary not found $filename', async ({ filename }: { filename: string }) => {
        const def: LoadOptions = dDef({
            path: filename,
            name: filename,
        });
        const dict = await dictionaryLoader.loadDictionary(def);
        expect(dict.getErrors?.()).toHaveLength(1);
    });

    function nfd(s: string): string {
        return s.normalize('NFD');
    }

    function nfc(s: string): string {
        return s.normalize('NFC');
    }

    const csharpDictExt = require.resolve('@cspell/dict-csharp/cspell-ext.json');
    const csharp = path.join(path.dirname(csharpDictExt), 'dict/csharp.txt.gz');

    // cspell:ignore aujourd’hui

    test.each`
        testCase            | file                          | options          | word               | maxAge       | hasWord  | hasErrors
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'apple'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'class:name'}    | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'class'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'name'}          | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'left-right'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 5 }}   | ${'apple'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'S' }} | ${'pear'}          | ${undefined} | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'strawberry'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'left-right'}    | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'left'}          | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'class:name'}    | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'name'}          | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'two words'}     | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'words'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'aujourd’hui'}   | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'strawberry'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'left-right'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'left'}          | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'class:name'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'name'}          | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'W' }} | ${'aujourd’hui'}   | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'two words'}     | ${1}         | ${false} | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{ type: 'C' }} | ${'words'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'tree'}          | ${1}         | ${false} | ${false}
        ${'unknown loader'} | ${sample('words.txt')}        | ${{ type: 5 }}   | ${'apple'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'left-right'}    | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${nfd('Geschäft')} | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${nfc('Geschäft')} | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'geschaft'}      | ${1}         | ${true}  | ${false}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{}}            | ${'apple'}         | ${1}         | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{ type: 'S' }} | ${'pear'}          | ${undefined} | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{ type: 'C' }} | ${'strawberry'}    | ${1}         | ${false} | ${true}
        ${'missing file'}   | ${'./missing_dictionary.txt'} | ${{}}            | ${'tree'}          | ${1}         | ${false} | ${true}
        ${'csharp type {}'} | ${csharp}                     | ${{}}            | ${'const'}         | ${1}         | ${true}  | ${false}
        ${'csharp type S'}  | ${csharp}                     | ${{ type: 'S' }} | ${'const'}         | ${1}         | ${true}  | ${false}
        ${'csharp type C'}  | ${csharp}                     | ${{ type: 'C' }} | ${'const'}         | ${1}         | ${true}  | ${false}
    `(
        'loadDictionary $testCase $word $options',
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
            await dictionaryLoader.refreshCacheEntries(maxAge, Date.now());
            const def = { ...options, path: file };
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.has(word)).toBe(hasWord);
            expect(!!d.getErrors?.().length).toBe(hasErrors);
        },
    );

    test.each`
        testCase                        | word               | hasWord  | ignoreCase
        ${''}                           | ${'apple'}         | ${true}  | ${true}
        ${''}                           | ${'pear'}          | ${true}  | ${true}
        ${''}                           | ${'strawberry'}    | ${true}  | ${true}
        ${''}                           | ${'tree'}          | ${false} | ${true}
        ${''}                           | ${'left-right'}    | ${true}  | ${true}
        ${''}                           | ${'left'}          | ${false} | ${true}
        ${''}                           | ${'right'}         | ${false} | ${true}
        ${'with apart accent over "a"'} | ${nfd('Geschäft')} | ${true}  | ${false}
        ${'with accent ä'}              | ${nfc('Geschäft')} | ${true}  | ${false}
        ${'with apart accent over "a"'} | ${nfd('Geschäft')} | ${true}  | ${true}
        ${'with accent ä'}              | ${nfc('Geschäft')} | ${true}  | ${true}
        ${'no case'}                    | ${'geschaft'}      | ${true}  | ${true}
        ${'not found because of case'}  | ${'geschaft'}      | ${false} | ${false}
    `(
        'dict has word $testCase $word',
        async ({ word, hasWord, ignoreCase }: { word: string; hasWord: boolean; ignoreCase?: boolean }) => {
            const file = sample('words.txt');
            const d = await dictionaryLoader.loadDictionary(dDef({ name: 'words', path: file }));
            expect(d.has(word, clean({ ignoreCase }))).toBe(hasWord);
        },
    );

    test.each`
        def                                                | word      | hasWord
        ${dDef({ name: 'words', words: ['New', 'York'] })} | ${'York'} | ${true}
    `('sync load inline dict has word $def $word', async ({ def, word, hasWord }) => {
        const d = await dictionaryLoader.loadDictionary(def);
        expect(d.has(word)).toBe(hasWord);
    });

    describe('kind', () => {
        test('kind: ignore-words behaves like noSuggest', async () => {
            const def = dDef({ name: 'words', path: sample('words.txt'), kind: 'ignore-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.has('apple')).toBe(true);
            expect(d.isForbidden('apple')).toBe(false);
            expect(d.find('apple')).toEqual(oc({ found: 'apple', forbidden: false, noSuggest: true }));
        });

        test('kind: words with suggestions.', async () => {
            const def = dDef({ name: 'words', path: sample('words.txt'), kind: 'words', ignoreForbiddenWords: true });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.has('apple')).toBe(true);
            expect(d.isForbidden('apple')).toBe(false);
            expect(d.find('apple')).toEqual(oc({ found: 'apple', forbidden: false, noSuggest: false }));
            expect(d.isForbidden('colour')).toBe(false);
            expect(d.getPreferredSuggestions?.('colour')).toEqual([{ cost: 1, isPreferred: true, word: 'color' }]);
            expect(d.find('colour')).toEqual(undefined);
        });

        test('kind: ignore-words will suggest fixes', async () => {
            const def = dDef({ name: 'ignore-words', path: sample('ignore-words.txt'), kind: 'ignore-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            // cspell:ignore colour:color
            expect(d.getPreferredSuggestions?.('colour')).toEqual([{ cost: 1, isPreferred: true, word: 'color' }]);
        });

        test('kind: suggest-words provides suggestions without adding words', async () => {
            const def = dDef({ name: 'suggest-words', path: sample('ignore-words.txt'), kind: 'suggest-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.has('colour')).toBe(false);
            expect(d.isForbidden('colour')).toBe(false);
            expect(d.find('colour')).toEqual(undefined);
            // cspell:ignore colour:color
            expect(d.getPreferredSuggestions?.('colour')).toEqual([{ cost: 1, isPreferred: true, word: 'color' }]);
        });

        test('kind: flag-words $type uses FlagWordsDictionary', async () => {
            const def = dDef({ name: 'flag-words', path: sample('flag-words.txt'), kind: 'flag-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.isForbidden('whilst')).toBe(true);
            expect(d.isForbidden('Whilst')).toBe(true);
            expect(d.isForbidden('grumpy')).toBe(true);
            expect(d.isForbidden('english')).toBe(true);
            expect(d.isForbidden('English')).toBe(false);
            expect(d.isForbidden('cSpell')).toBe(true);
            expect(d.isForbidden('cspell')).toBe(false);
            expect(d.getPreferredSuggestions?.('english')?.map((p) => p.word)).toEqual(['English']);
            expect(d.has('whilst')).toBe(false);
            expect(d.has('apple')).toBe(false);
            expect(d.has('English')).toBe(false);
        });

        test('kind: flag-words $type uses FlagWordsDictionary ignoreForbiddenWords', async () => {
            const def = dDef({
                name: 'flag-words',
                path: sample('flag-words.txt'),
                kind: 'flag-words',
                ignoreForbiddenWords: true,
            });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.isForbidden('english')).toBe(true);
            expect(d.getPreferredSuggestions?.('english')?.map((p) => p.word)).toEqual(['English']);
        });

        test('kind: flag-words $type uses FlagWordsDictionary trie', async () => {
            const def = dDef({ name: 'flag-cities', path: dict('cities.trie.gz'), kind: 'flag-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.isForbidden('London')).toBe(true);
            expect(d.isForbidden('Paris')).toBe(true);
            expect(d.isForbidden('Berlin')).toBe(false);
        });

        test('kind: suggest-words $type uses SuggestDictionary trie', async () => {
            const def = dDef({ name: 'suggest-cities', path: dict('cities.trie.gz'), kind: 'suggest-words' });
            const d = await dictionaryLoader.loadDictionary(def);
            expect(d.has('London')).toBe(false);
            expect(d.isForbidden('London')).toBe(false);
        });
    });

    // cspell:ignore Geschäft geschaft
});

function sample(file: string): string {
    return path.join(samples, file);
}

function dict(file: string): string {
    const dictDir = path.join(root, '../../fixtures/Samples/dicts');
    return path.resolve(dictDir, file);
}

interface DDefFile extends Partial<DictionaryFileDefinitionInternal> {
    name: string;
    path: string;
}

type DDef = DDefFile | DictionaryDefinitionInlineInternal;

function dDef(opts: DDef): DictionaryDefinitionInternal {
    const def = di(opts, pathToFileURL(__filename));
    return def;
}
