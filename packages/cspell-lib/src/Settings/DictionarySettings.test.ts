/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as DictSettings from './DictionarySettings';
import * as fsp from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { getDefaultSettings } from './DefaultSettings';

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
            .map((p) => p[1])
            .map((def) => def.path!)
            .map((path) => fsp.access(path));
        expect(mapDefs.length).toBeGreaterThan(0);
        return Promise.all(access);
    });

    test('tests normalizing the dictionary paths', () => {
        const { dictionaryDefinitions } = defaultSettings;
        expect(dictionaryDefinitions).not.toHaveLength(0);
        const defs = DictSettings.normalizePathForDictDefs(dictionaryDefinitions!, '.');
        expect(defs.length).toBe(dictionaryDefinitions!.length);

        const basePath = path.join('some', 'dir', 'words.txt');
        const legacyDictionaryDefinitions = (dictionaryDefinitions || []).map((a) => ({ ...a }));
        legacyDictionaryDefinitions[0].path = path.join('~', basePath);
        legacyDictionaryDefinitions[0].file = '';
        const tildeDefs = DictSettings.normalizePathForDictDefs(legacyDictionaryDefinitions!, '.');
        expect(tildeDefs[0].path).toBe(path.join(os.homedir(), basePath));
    });
});
