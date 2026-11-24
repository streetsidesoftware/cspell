import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';

import type { CSpellUserSettings } from '@cspell/cspell-types';
import { StrongWeakMap } from '@cspell/strong-weak-map';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { pathPackageRoot } from '../../test-util/test.locations.js';
import { createDictionaryReferenceCollection } from '../Settings/DictionaryReferenceCollection.js';
import {
    createCSpellSettingsInternal as csi,
    filterDictDefsToLoad,
    getDefaultBundledSettingsAsync,
    loadConfig,
    mapDictDefToInternal,
} from '../Settings/index.js';
import * as Dictionaries from './Dictionaries.js';
import { isSpellingDictionaryLoadError } from './SpellingDictionaryError.js';

// cspell:ignore café rhône
const mkdirp = async (p: string) => {
    await fs.mkdir(p, { recursive: true });
};

const root = pathPackageRoot;
const samples = path.join(root, 'samples');

const debug = false;

function log(msg: string): void {
    if (debug) {
        console.log(msg);
    }
}

const __filenameURL = new URL(import.meta.url);

const di = mapDictDefToInternal;

describe('Validate getDictionary', () => {
    const ignoreCaseFalse = { ignoreCase: false };
    const ignoreCaseTrue = { ignoreCase: true };

    test.each`
        word       | opts               | expected
        ${'zero'}  | ${ignoreCaseFalse} | ${false}
        ${'Café'}  | ${ignoreCaseFalse} | ${true}
        ${'CAFÉ'}  | ${ignoreCaseFalse} | ${true}
        ${'café'}  | ${ignoreCaseFalse} | ${true}
        ${'cafe'}  | ${ignoreCaseTrue}  | ${true}
        ${'CAFE'}  | ${ignoreCaseTrue}  | ${true}
        ${'Rhône'} | ${ignoreCaseFalse} | ${true}
        ${'RHÔNE'} | ${ignoreCaseFalse} | ${true}
        ${'rhône'} | ${ignoreCaseFalse} | ${false}
        ${'RHÔNE'} | ${ignoreCaseTrue}  | ${true}
        ${'rhône'} | ${ignoreCaseTrue}  | ${true}
        ${'rhone'} | ${ignoreCaseFalse} | ${false}
        ${'rhone'} | ${ignoreCaseTrue}  | ${true}
        ${'snarf'} | ${ignoreCaseTrue}  | ${false}
    `('tests that userWords are included in the dictionary $word', async ({ word, opts, expected }) => {
        const settings = csi({
            ...(await getDefaultBundledSettingsAsync()),
            dictionaries: [],
            words: ['one', 'two', 'three', 'café', '!snarf'],
            userWords: ['four', 'five', 'six', 'Rhône'],
        });

        const dict = await Dictionaries.getDictionaryInternal(settings);
        settings.words?.forEach((w) => {
            const word = w.replace(/^[!+*]*(.*?)[*+]*$/, '$1');
            const found = w[0] !== '!';
            const result = { word, found: dict.has(word) };
            expect(result).toEqual({ word, found });
        });
        settings.userWords?.forEach((w) => {
            const word = w.replace(/^[!+*]*(.*?)[*+]*$/, '$1');
            const found = w[0] !== '!';
            const result = { word, found: dict.has(word) };
            expect(result).toEqual({ word, found });
        });
        expect(dict.has(word, opts)).toBe(expected);
    });

    // cspell:ignore zeromq hte colour
    test.each`
        word            | expected
        ${'grapefruit'} | ${undefined /* should not be found since no locale was used. */}
        ${'zeromq'}     | ${{ found: 'zeromq', forbidden: false, noSuggest: false }}
        ${'zeros'}      | ${{ found: 'zeros', forbidden: false, noSuggest: true }}
        ${'google'}     | ${{ found: 'google', forbidden: false, noSuggest: true }}
        ${'Café'}       | ${{ found: 'café', forbidden: false, noSuggest: false }}
        ${'CAFÉ'}       | ${{ found: 'café', forbidden: false, noSuggest: false }}
        ${'café'}       | ${{ found: 'café', forbidden: false, noSuggest: false }}
        ${'cafe'}       | ${{ found: 'cafe', forbidden: false, noSuggest: false }}
        ${'CAFE'}       | ${{ found: 'cafe', forbidden: false, noSuggest: false }}
        ${'Rhône'}      | ${{ found: 'Rhône', forbidden: false, noSuggest: false }}
        ${'RHÔNE'}      | ${{ found: 'rhône', forbidden: false, noSuggest: false }}
        ${'rhône'}      | ${{ found: 'rhône', forbidden: false, noSuggest: false }}
        ${'rhone'}      | ${{ found: 'rhone', forbidden: false, noSuggest: false }}
        ${'snarf'}      | ${{ found: 'snarf', forbidden: true, noSuggest: false }}
        ${'hte'}        | ${{ found: 'hte', forbidden: true, noSuggest: false }}
        ${'colour'}     | ${{ found: 'colour', forbidden: true, noSuggest: false }}
    `('find words $word', async ({ word, expected }) => {
        const settings = csi({
            ...(await getDefaultBundledSettingsAsync()),
            noSuggestDictionaries: ['companies'],
            words: ['one', 'two', 'three', 'café', '!snarf'],
            userWords: ['four', 'five', 'six', 'Rhône'],
            ignoreWords: ['zeros'],
            flagWords: ['hte', 'colour'],
        });
        const dict = await Dictionaries.getDictionaryInternal(settings);
        expect(dict.find(word)).toEqual(expected);
    });

    test.each`
        noSuggestDictionaries
        ${[]}
        ${['companies', 'software-term-suggestions']}
    `('dictionaries are reused, noSuggestDictionaries: $noSuggestDictionaries', async ({ noSuggestDictionaries }) => {
        const settings = csi({ ...(await getDefaultBundledSettingsAsync()), noSuggestDictionaries });
        const a = await Dictionaries.getDictionaryInternal(settings);
        const b = await Dictionaries.getDictionaryInternal(settings);
        const names = a.dictionaries.map((d) => d.name);
        expect(names).toEqual(expect.arrayContaining(['companies', 'software-term-suggestions']));
        const reused = new Set(a.dictionaries);
        expect(b.dictionaries.filter((d) => !reused.has(d)).map((d) => d.name)).toEqual([]);
    });

    test.each`
        word       | opts               | expected
        ${'zero'}  | ${undefined}       | ${false}
        ${'Rhône'} | ${ignoreCaseFalse} | ${true}
        ${'RHÔNE'} | ${ignoreCaseFalse} | ${true}
        ${'Café'}  | ${ignoreCaseFalse} | ${true}
        ${'rhône'} | ${ignoreCaseFalse} | ${false}
        ${'rhone'} | ${ignoreCaseFalse} | ${false}
        ${'café'}  | ${ignoreCaseFalse} | ${true}
        ${'rhône'} | ${ignoreCaseFalse} | ${false}
        ${'rhone'} | ${ignoreCaseFalse} | ${false}
        ${'cafe'}  | ${ignoreCaseFalse} | ${false}
        ${'café'}  | ${ignoreCaseTrue}  | ${true}
        ${'rhône'} | ${ignoreCaseTrue}  | ${true}
        ${'rhone'} | ${ignoreCaseTrue}  | ${true}
        ${'cafe'}  | ${ignoreCaseTrue}  | ${true}
    `('Case sensitive "$word" $opts', async ({ word, opts, expected }) => {
        const settings = {
            ...(await getDefaultBundledSettingsAsync()),
            dictionaries: [],
            words: ['one', 'two', 'three', 'café'],
            userWords: ['four', 'five', 'six', 'Rhône'],
            caseSensitive: true,
        };

        const dict = await Dictionaries.getDictionaryInternal(settings);
        settings.words.forEach((word) => {
            const result = { word, found: dict.has(word) };
            expect(result).toEqual({ word, found: true });
        });
        settings.userWords.forEach((word) => {
            const result = { word, found: dict.has(word) };
            expect(result).toEqual({ word, found: true });
        });
        expect(dict.has(word, opts)).toBe(expected);
    });

    test('Dictionary NOT Found', async () => {
        const settings = csi({
            dictionaryDefinitions: [di({ name: 'my-words', path: './not-found.txt' }, __filenameURL)],
            dictionaries: ['my-words'],
        });

        const dict = await Dictionaries.getDictionaryInternal(settings);
        expect(dict.getErrors()).toEqual([expect.objectContaining(new Error('my-words: failed to load'))]);
        expect(dict.dictionaries.map((d) => d.name)).toEqual([
            'my-words',
            '[words]',
            '[ignoreWords]',
            '[flagWords]',
            '[suggestWords]',
        ]);
    });

    interface TestLoadFromConfig {
        configFile: string;
        expectedErrors: Error[];
    }

    test.each`
        configFile                              | expectedErrors
        ${sample('yaml-config/cspell.yaml')}    | ${[{ name: 'missing dictionary file', message: 'failed to load' }]}
        ${sample('.cspell.json')}               | ${[{ name: 'missing dictionary file', message: 'failed to load' }]}
        ${sample('js-config/cspell.config.js')} | ${[]}
    `(
        'Load related dictionaries for config $configFile',
        async ({ configFile, expectedErrors }: TestLoadFromConfig) => {
            const settings = await loadConfig(configFile);
            if (!settings) {
                expect(settings).toBeDefined();
                return;
            }
            // Enable ALL dictionaries
            settings.dictionaries = getAllDictionaryNames(settings);
            const d = await Dictionaries.getDictionaryInternal(settings);
            const errors = d.getErrors();
            expect(errors).toHaveLength(expectedErrors.length);
            errors.forEach((e) => expect(isSpellingDictionaryLoadError(e)).toBe(true));
            expect(errors).toEqual(expect.arrayContaining(expectedErrors.map((e) => expect.objectContaining(e))));
        },
    );
});

describe('Validate collection reuse', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const dictionaryDefinitions = [
        di({ name: 'colors', words: ['red', 'green'] }, __filenameURL),
        di({ name: 'numbers', words: ['one', 'two'] }, __filenameURL),
    ];

    function getDict(settings: CSpellUserSettings) {
        return Dictionaries.getDictionaryInternal(csi({ ...settings, dictionaryDefinitions }));
    }

    test('the same dictionaries share a collection', async () => {
        const a = await getDict({ dictionaries: ['colors', 'numbers'], words: ['apple'] });
        const b = await getDict({ dictionaries: ['numbers', 'colors'], words: ['apple'] });
        expect(b).toBe(a);
    });

    test.each`
        settings
        ${{ dictionaries: ['colors'], words: ['apple'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['pear'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['apple'], userWords: ['pear'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['apple'], flagWords: ['pear'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['apple'], ignoreWords: ['pear'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['apple'], suggestWords: ['pear->apple'] }}
        ${{ dictionaries: ['colors', 'numbers'], words: ['apple'], noSuggestDictionaries: ['numbers'] }}
    `('different dictionaries do not share a collection: $settings', async ({ settings }) => {
        const a = await getDict({ dictionaries: ['colors', 'numbers'], words: ['apple'] });
        const b = await getDict(settings);
        expect(b).not.toBe(a);
    });

    test('a reloaded dictionary gets a new collection', async () => {
        const file = tempPath('words.txt');
        await mkdirp(path.dirname(file));
        await fs.writeFile(file, 'one\n');
        const settings = csi({
            dictionaryDefinitions: [di({ name: 'temp', path: file }, __filenameURL)],
            dictionaries: ['temp'],
        });

        const a = await Dictionaries.getDictionaryInternal(settings);
        expect(a.has('two')).toBe(false);

        await fs.writeFile(file, 'one\ntwo\n');
        await Dictionaries.refreshDictionaryCache(0);

        const b = await Dictionaries.getDictionaryInternal(settings);
        expect(b).not.toBe(a);
        expect(b.has('two')).toBe(true);
        expect(a.has('two')).toBe(false);
    });

    test('collections are released', async () => {
        const getRef = async (word: string) => new WeakRef(await getDict({ dictionaries: ['colors'], words: [word] }));
        const ref = await getRef('released');
        const held = await getDict({ dictionaries: ['colors'], words: ['held'] });
        const heldRef = await getRef('held');
        await collectGarbage();
        expect(ref.deref()).toBeUndefined();
        expect(heldRef.deref()).toBe(held);
    });

    test('the keys of released collections are removed', async () => {
        const cleanKeys = vi.spyOn(StrongWeakMap.prototype, 'cleanKeys');
        for (let i = 0; i < 250; ++i) {
            await getDict({ dictionaries: ['colors'], words: ['word' + i] });
            if (i % 50 === 0) await collectGarbage();
        }
        expect(cleanKeys).toHaveBeenCalled();
        const map = cleanKeys.mock.contexts[0] as StrongWeakMap<string, object>;
        expect(map.size).toBeLessThan(250);
    });
});

describe('Validate Refresh', () => {
    test('Refresh Dictionary Cache', async () => {
        log(`Start: ${expect.getState().currentTestName}; ts: ${Date.now()}`);
        const tempDictPath = tempPath('words.txt');
        const tempDictPathNotFound = tempPath('not-found.txt');
        await mkdirp(path.dirname(tempDictPath));
        await fs.writeFile(tempDictPath, 'one\ntwo\nthree\n');
        const settings = await getDefaultBundledSettingsAsync();
        const defs = [
            ...(settings.dictionaryDefinitions || []),
            di({ name: 'temp', path: tempDictPath }, __filenameURL),
            di({ name: 'not_found', path: tempDictPathNotFound }, __filenameURL),
        ];
        const toLoad = ['node', 'html', 'css', 'not_found', 'temp'];
        const col = createDictionaryReferenceCollection(toLoad);
        const defsToLoad = filterDictDefsToLoad(col, defs);
        expect(defsToLoad.map((d) => d.name)).toEqual(['css', 'html', 'node', 'temp', 'not_found']);
        const dicts = await Promise.all(Dictionaries.loadDictionaryDefs(defsToLoad));

        expect(dicts[3].has('one')).toBe(true);
        expect(dicts[3].has('four')).toBe(false);
        expect(dicts.map((d) => d.name)).toEqual(['css', 'html', 'node', 'temp', 'not_found']);

        await Dictionaries.refreshDictionaryCache(0);
        const dicts2 = await Promise.all(Dictionaries.loadDictionaryDefs(defsToLoad));

        // Since noting changed, expect them to be the same.
        expect(dicts.length).toEqual(toLoad.length);
        expect(dicts2.length).toEqual(dicts.length);
        dicts.forEach((d, i) => expect(dicts2[i]).toEqual(d));

        // Update one of the dictionaries to see if it loads.
        await fs.writeFile(tempDictPath, 'one\ntwo\nthree\nfour\n');

        const dicts3 = await Promise.all(Dictionaries.loadDictionaryDefs(defsToLoad));
        // Should be using cache and will not contain the new words.
        expect(dicts3[3].has('one')).toBe(true);
        expect(dicts3[3].has('four')).toBe(false);
        expect(dicts3.map((d) => d.name)).toEqual(['css', 'html', 'node', 'temp', 'not_found']);

        await Dictionaries.refreshDictionaryCache(0);

        const dicts4 = await Promise.all(Dictionaries.loadDictionaryDefs(defsToLoad));
        expect(dicts4.map((d) => d.name)).toEqual(['css', 'html', 'node', 'temp', 'not_found']);
        // Should be using the latest copy of the words.
        expect(dicts4[3].has('one')).toBe(true);
        expect(dicts4[3].has('four')).toBe(true);
        log(`End: ${expect.getState().currentTestName} at ${Date.now()}`);
    });
});

async function collectGarbage() {
    setFlagsFromString('--expose-gc');
    const gc: () => void = runInNewContext('gc');
    // A `WeakRef` keeps its target until the current job has finished.
    await setTimeout(1);
    gc();
    await setTimeout(1);
}

function tempPath(file: string) {
    const testState = expect.getState();
    const testName = (testState.currentTestName || 'test').replaceAll(/[^-a-z0-9]/gi, '_');
    return path.join(pathPackageRoot, 'temp', testName, file);
}

function sample(file: string): string {
    return path.join(samples, file);
}

function getAllDictionaryNames(settings: CSpellUserSettings): string[] {
    const { dictionaries = [], dictionaryDefinitions = [] } = settings;

    return [...dictionaries, ...dictionaryDefinitions.map((d) => d.name)];
}
