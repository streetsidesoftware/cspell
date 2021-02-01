/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as DictSettings from './DictionarySettings';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { getDefaultSettings } from './DefaultSettings';
import { DictionaryDefinition, DictionaryDefinitionLegacy } from '@cspell/cspell-types';

const defaultSettings = getDefaultSettings();

describe('Validate DictionarySettings', () => {
    test('expects default to not be empty', () => {
        const mapDefs = DictSettings.filterDictDefsToLoad(
            ['php', 'wordsEn', 'unknown', 'en_us'],
            defaultSettings.dictionaryDefinitions!
        );
        const files = mapDefs.map((a) => a[1]).map((def) => def.name!);
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
        const mapDefs = DictSettings.filterDictDefsToLoad(ids, defaultSettings.dictionaryDefinitions!);
        const dicts = mapDefs
            .map((a) => a[1])
            .map((def) => def.name!)
            .sort();
        expect(dicts).toEqual(expected);
    });

    test('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions!;
        const dictIds = defaultDicts.map((def) => def.name);
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions!);
        const access = mapDefs
            .map(([_, def]) => def)
            .map((def) => def.path!)
            .map((path) => fsp.access(path));
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

        const nDef = DictSettings.normalizePathForDictDef(def, pathToConfig);
        expect(nDef).toEqual({
            name: 'words',
            path: absolutePath,
            __source: pathToConfig,
        });

        const legacyDef: DictionaryDefinitionLegacy = {
            name: 'words',
            path: path.dirname(path.join('~', basePath)),
            file: path.basename(basePath),
        };

        const nLegacyDef = DictSettings.normalizePathForDictDef(legacyDef, pathToConfig);

        expect(nLegacyDef).toEqual(nDef);
    });

    test('Double normalize', () => {
        const configFile = './cspell.json';
        const def: DictionaryDefinition = {
            name: 'Text Dict',
            path: './words.txt',
        };

        const normalizedDef = DictSettings.normalizePathForDictDef(def, configFile);
        expect(DictSettings.isDictionaryDefinitionWithSource(normalizedDef)).toBe(true);
        expect(normalizedDef).toEqual(expect.objectContaining({ __source: configFile }));

        const normalizedDef2 = DictSettings.normalizePathForDictDef(normalizedDef, configFile);
        expect(normalizedDef2).toBe(normalizedDef);

        expect(() => DictSettings.normalizePathForDictDef(normalizedDef, './different.config.json')).toThrowError(
            'Trying to normalize a dictionary definition with a different source.'
        );
    });
});
