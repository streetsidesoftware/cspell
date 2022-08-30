/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { DictionaryDefinition, DictionaryDefinitionLegacy } from '@cspell/cspell-types';
import * as fsp from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { getDefaultBundledSettings } from './DefaultSettings';
import { createDictionaryReferenceCollection as createRefCol } from './DictionaryReferenceCollection';
import * as DictSettings from './DictionarySettings';

const defaultSettings = getDefaultBundledSettings();
const oc = expect.objectContaining;

describe('Validate DictionarySettings', () => {
    test('expects default to not be empty', () => {
        const mapDefs = DictSettings.filterDictDefsToLoad(
            createRefCol(['php', 'wordsEn', 'unknown', 'en_us']),
            defaultSettings.dictionaryDefinitions!
        );
        const files = mapDefs.map((def) => def.name!);
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
        const mapDefs = DictSettings.filterDictDefsToLoad(createRefCol(ids), defaultSettings.dictionaryDefinitions!);
        const dicts = mapDefs.map((def) => def.name!).sort();
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
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions!);
        const dicts = mapDefs.map((def) => def.name!).sort();
        expect(dicts).toEqual(expectedIds);
    });

    test('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions!;
        const dictIds = createRefCol(defaultDicts.map((def) => def.name));
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions!);
        const access = mapDefs.map((def) => def.path!).map((path) => fsp.access(path));
        expect(mapDefs.length).toBeGreaterThan(0);
        return Promise.all(access);
    });

    test('tests default dictionary settings have been normalized', () => {
        const { dictionaryDefinitions } = defaultSettings;
        expect(dictionaryDefinitions?.length).toBeGreaterThan(1);
        dictionaryDefinitions?.forEach((def) => {
            expect(DictSettings.isDictionaryDefinitionWithSource(def)).toBe(true);
            expect(path.isAbsolute(def.path || '')).toBe(true);
        });
    });

    test('tests normalizing home dir', () => {
        const pathToConfig = './cspell.json';
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
                __source: pathToConfig,
            })
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
        const configFile = './cspell.json';
        const def: DictionaryDefinition = {
            name: 'Text Dict',
            path: './words.txt',
        };

        const normalizedDef = DictSettings.mapDictDefToInternal(def, configFile);
        expect(DictSettings.isDictionaryDefinitionWithSource(normalizedDef)).toBe(true);
        expect(normalizedDef).toEqual(expect.objectContaining({ __source: configFile }));

        const normalizedDef2 = DictSettings.mapDictDefToInternal(normalizedDef, configFile);
        expect(normalizedDef2).toBe(normalizedDef);

        expect(() => DictSettings.mapDictDefToInternal(normalizedDef, './different.config.json')).toThrow(
            'Trying to normalize a dictionary definition with a different source.'
        );
    });

    test.each`
        def                                                                                   | expected
        ${{}}                                                                                 | ${false}
        ${DictSettings.mapDictDefToInternal({ name: 'def', path: './dict.txt' }, __filename)} | ${true}
    `('isDictionaryDefinitionInternal', ({ def, expected }) => {
        expect(DictSettings.isDictionaryDefinitionInternal(def)).toBe(expected);
    });
});
