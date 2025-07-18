import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test, vi } from 'vitest';

import { pathPackageRoot, pathPackageSamples } from '../../test-util/test.locations.js';
import type {
    DictionaryDefinitionInternal,
    DictionaryFileDefinitionInternal,
} from '../Models/CSpellSettingsInternalDef.js';
import { mapDictDefToInternal } from '../Settings/DictionarySettings.js';
import { clean } from '../util/util.js';
import type { LoadOptions } from './DictionaryLoader.js';
import { loadDictionary, refreshCacheEntries } from './DictionaryLoader.js';

vi.mock('../util/logger');

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);

const root = pathPackageRoot;
const samples = pathPackageSamples;

const di = mapDictDefToInternal;

describe('Validate DictionaryLoader', () => {
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
        const dict = await loadDictionary(def);
        expect(dict.getErrors?.()).toHaveLength(1);
    });

    function nfd(s: string): string {
        return s.normalize('NFD');
    }

    function nfc(s: string): string {
        return s.normalize('NFC');
    }
    // cspell:ignore aujourd’hui
    const csharpDictExt = require.resolve('@cspell/dict-csharp/cspell-ext.json');
    const csharp = path.join(path.dirname(csharpDictExt), 'csharp.txt.gz');
    test.each`
        testCase            | file                          | options          | word               | maxAge       | hasWord  | hasErrors
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'apple'}         | ${1}         | ${true}  | ${false}
        ${'sample words'}   | ${sample('words.txt')}        | ${{}}            | ${'class:name'}    | ${1}         | ${true}  | ${false}
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
            await refreshCacheEntries(maxAge, Date.now());
            const def = { ...options, path: file };
            const d = await loadDictionary(def);
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
            const d = await loadDictionary(dDef({ name: 'words', path: file }));
            expect(d.has(word, clean({ ignoreCase }))).toBe(hasWord);
        },
    );

    test.each`
        def                                                             | word          | hasWord
        ${dDef({ name: 'words', path: sample('words.txt.gz') })}        | ${'apple'}    | ${true}
        ${dDef({ name: 'words', path: dict('cities.trie.gz') })}        | ${'apple'}    | ${false}
        ${dDef({ name: 'words', path: dict('cities.trie.gz') })}        | ${'New York'} | ${true}
        ${dDef({ name: 'words', path: dict('cities.txt') })}            | ${'York'}     | ${false}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'C' })} | ${'New York'} | ${false}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'C' })} | ${'York'}     | ${true}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'S' })} | ${'New York'} | ${true}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'S' })} | ${'York'}     | ${false}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'W' })} | ${'New York'} | ${false}
        ${dDef({ name: 'words', path: dict('cities.txt'), type: 'W' })} | ${'York'}     | ${true}
        ${{ name: 'cities', words: ['Paris', 'New York'] }}             | ${'New York'} | ${true}
        ${dDef({ name: 'words', path: dict('cities.utf16le.txt') })}    | ${'New York'} | ${true}
        ${dDef({ name: 'words', path: dict('cities.utf16be.txt') })}    | ${'New York'} | ${true}
    `('async load dict has word $def $word', async ({ def, word, hasWord }) => {
        const d = await loadDictionary(def);
        expect(d.has(word)).toBe(hasWord);
    });

    // cspell:ignore Geschäft geschaft
});

function sample(file: string): string {
    return path.join(samples, file);
}

function dict(file: string): string {
    const dictDir = path.join(root, '../Samples/dicts');
    return path.resolve(dictDir, file);
}

interface DDef extends Partial<DictionaryFileDefinitionInternal> {
    name: string;
    path: string;
}

function dDef(opts: DDef): DictionaryDefinitionInternal {
    return di(opts, pathToFileURL(__filename));
}
