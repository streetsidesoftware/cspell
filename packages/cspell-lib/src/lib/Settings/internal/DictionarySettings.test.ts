import assert from 'node:assert';
import * as fsp from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { DictionaryDefinition, DictionaryDefinitionLegacy } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { isDefined } from '../../util/util.js';
import { getDefaultBundledSettingsAsync } from '../DefaultSettings.js';
import { createDictionaryReferenceCollection as createRefCol } from '../DictionaryReferenceCollection.js';
import { createCSpellSettingsInternal as csi } from './CSpellSettingsInternalDef.js';
import * as DictSettings from './DictionarySettings.js';
import type { DictionaryDefinitionInternal } from './InternalDictionaryDef.js';
import { isDictionaryDefinitionInlineInternal } from './InternalDictionaryDef.js';

const __filename = fileURLToPath(import.meta.url);

const defaultSettings = await getDefaultBundledSettingsAsync();
const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Validate DictionarySettings', () => {
    test('expects default to not be empty', () => {
        assert(defaultSettings.dictionaryDefinitions);
        const mapDefs = DictSettings.filterDictDefsToLoad(
            createRefCol(['php', 'wordsEn', 'unknown', 'en_us']),
            defaultSettings.dictionaryDefinitions,
        );
        const files = mapDefs.map((def) => def.name);
        expect(mapDefs).toHaveLength(2);
        expect(files.filter((a) => a.includes('php'))).toHaveLength(1);
        expect(files.filter((a) => a.includes('wordsEn'))).toHaveLength(0);
        expect(files.filter((a) => a.includes('en_us'))).toHaveLength(1);
        expect(files.filter((a) => a.includes('unknown'))).toHaveLength(0);
    });

    test('tests exclusions and empty ids', () => {
        const ids = [
            'php',
            'cpp', // add cpp
            'wordsEn',
            '  ', // empty entry
            'unknown',
            '!cpp', // remove cpp
            'en_us',
        ];
        const expected = ['php', 'en_us'].sort();
        assert(defaultSettings.dictionaryDefinitions);
        const mapDefs = DictSettings.filterDictDefsToLoad(createRefCol(ids), defaultSettings.dictionaryDefinitions);
        const dicts = mapDefs.map((def) => def.name).sort();
        expect(dicts).toEqual(expected);
    });

    test.each`
        ids                          | expected
        ${'!php, php, cpp, !!cpp'}   | ${'cpp'}
        ${'!php, php, !!php, !!cpp'} | ${'cpp, php'}
        ${'!!!!!!!!!!cpp, !cpp'}     | ${'cpp'}
    `('validate dictionary exclusions $ids', ({ ids, expected }: { ids: string; expected: string }) => {
        const dictIds = createRefCol(ids.split(','));
        const expectedIds = expected.split(',').map((id) => id.trim());
        assert(defaultSettings.dictionaryDefinitions);
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions);
        const dicts = mapDefs.map((def) => def.name).sort();
        expect(dicts).toEqual(expectedIds);
    });

    test('tests that the files exist', () => {
        assert(defaultSettings.dictionaryDefinitions);
        const defaultDicts = defaultSettings.dictionaryDefinitions;
        const dictIds = createRefCol(defaultDicts.map((def) => def.name));
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions);
        const access = mapDefs
            .filter((def) => !isDictionaryDefinitionInlineInternal(def))
            .map((def) => def.path)
            .filter(isDefined)
            .map((path) => fsp.access(path));
        expect(mapDefs.length).toBeGreaterThan(0);
        return Promise.all(access);
    });

    test('tests default dictionary settings have been normalized', () => {
        const { dictionaryDefinitions } = defaultSettings;
        expect(dictionaryDefinitions?.length).toBeGreaterThan(1);
        dictionaryDefinitions?.forEach((def) => {
            expect(DictSettings.isDictionaryDefinitionWithSource(def)).toBe(true);
            const isInline = isDictionaryDefinitionInlineInternal(def);
            expect(isInline || path.isAbsolute(def.path || '')).toBe(true);
        });
    });

    test('tests normalizing home dir', () => {
        const pathToConfig = pathToFileURL('./cspell.json');
        const basePath = path.join('some', 'dir', 'words.txt');
        const absolutePath = path.join(os.homedir(), basePath);
        const def: DictionaryDefinition = {
            name: 'words',
            path: path.join('~', basePath),
        };

        const nDef = DictSettings.mapDictDefToInternal(def, pathToConfig);
        expect(nDef).toEqual(
            oc({
                name: 'words',
                path: absolutePath,
                __source: pathToConfig.href,
            }),
        );

        const legacyDef: DictionaryDefinitionLegacy = {
            name: 'words',
            path: path.dirname(path.join('~', basePath)),
            file: path.basename(basePath),
        };

        const nLegacyDef = DictSettings.mapDictDefToInternal(legacyDef, pathToConfig);

        expect(nLegacyDef).toEqual(nDef);
    });

    test('Double normalize', () => {
        const configFile = pathToFileURL('./cspell.json');
        const def: DictionaryDefinition = {
            name: 'Text Dict',
            path: './words.txt',
        };

        const normalizedDef = DictSettings.mapDictDefToInternal(def, configFile);
        expect(DictSettings.isDictionaryDefinitionWithSource(normalizedDef)).toBe(true);
        expect(normalizedDef).toEqual(expect.objectContaining({ __source: configFile.href }));

        const normalizedDef2 = DictSettings.mapDictDefToInternal(normalizedDef, configFile);
        expect(normalizedDef2).toBe(normalizedDef);
    });

    test.each`
        def                                                                                                  | expected
        ${{}}                                                                                                | ${false}
        ${DictSettings.mapDictDefToInternal({ name: 'def', path: './dict.txt' }, pathToFileURL(__filename))} | ${true}
    `('isDictionaryDefinitionInternal', ({ def, expected }) => {
        expect(DictSettings.isDictionaryDefinitionInternal(def)).toBe(expected);
    });

    test.each`
        def                                                                                                  | expected
        ${DictSettings.mapDictDefToInternal({ name: 'def', path: './dict.txt' }, pathToFileURL(__filename))} | ${{ name: 'def', path: expect.stringContaining('dict.txt') }}
    `('toJSON', ({ def, expected }) => {
        expect(def.toJSON()).toEqual(expected);
    });

    test('filterDictDefsToLoad returns the given definitions', () => {
        const defs = defaultSettings.dictionaryDefinitions;
        assert(defs);
        const inlineDefs = defs.filter(isDictionaryDefinitionInlineInternal);
        expect(inlineDefs.length).toBeGreaterThan(0);
        const loaded = DictSettings.filterDictDefsToLoad(createRefCol(defs.map((def) => def.name)), defs);
        expect(loaded.length).toBeGreaterThan(inlineDefs.length);
        const given = new Set(defs);
        expect(loaded.filter((def) => !given.has(def))).toEqual([]);
    });

    test('filterDictDefsToLoad resolves `file`', () => {
        const def = { name: 'words', path: 'some/dir', file: 'words.txt' };
        const loaded = DictSettings.filterDictDefsToLoad(createRefCol(['words']), [
            def as unknown as DictionaryDefinitionInternal,
        ]);
        expect(loaded).toEqual([{ name: 'words', path: path.join('some/dir', 'words.txt') }]);
    });

    const source = pathToFileURL(__filename);
    const fileDef = () => DictSettings.mapDictDefToInternal({ name: 'file', path: './dict.txt' }, source);
    const inlineDef = () => DictSettings.mapDictDefToInternal({ name: 'inline', words: ['one'] }, source);

    test.each`
        name        | createDef
        ${'file'}   | ${fileDef}
        ${'inline'} | ${inlineDef}
    `('calcDictionaryDefsToLoad reuses the noSuggest definition: $name', ({ name, createDef }) => {
        const dictionaryDefinitions = [createDef()];
        const load = (noSuggestDictionaries: string[]) => {
            const settings = csi({ dictionaryDefinitions, dictionaries: [name], noSuggestDictionaries });
            const [def] = DictSettings.calcDictionaryDefsToLoad(settings);
            return def;
        };

        expect(load([])).toBe(dictionaryDefinitions[0]);

        const noSuggest = load([name]);
        expect(noSuggest).toEqual(oc({ name, noSuggest: true }));
        expect(load([name])).toBe(noSuggest);

        const suggest = load(['!' + name]);
        expect(suggest).toEqual(oc({ name, noSuggest: false }));
        expect(load(['!' + name])).toBe(suggest);

        expect(load([name])).toEqual(noSuggest);
        expect(load([])).toBe(dictionaryDefinitions[0]);
        expect(dictionaryDefinitions[0].noSuggest).toBeUndefined();
    });
});
