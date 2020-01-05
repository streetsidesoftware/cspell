import {
    mergeSettings,
    readSettings,
    getGlobalSettings,
    clearCachedFiles,
    getCachedFileSize,
    checkFilenameMatchesGlob,
    calcOverrideSettings,
    getSources,
} from './CSpellSettingsServer';
import { getDefaultSettings, _defaultSettings } from './DefaultSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as path from 'path';

describe('Validate CSpellSettingsServer', () => {
    test('tests mergeSettings', () => {
        const left = { name: 'Left' };
        const right = { name: 'Right' };
        expect(mergeSettings(left, right)).toEqual({
            words: [],
            name: 'Left|Right',
            id: '|',
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'Left|Right', sources: [left, right]},
        });
    });

    test('tests mergeSettings', () => {
        const left = { id: 'left' };
        const enabled = { id: 'enabledId', name: 'enabledName', enabled: true};
        expect(mergeSettings(left, enabled)).toEqual({
            enabled: true,
            name: '|enabledName',
            id: 'left|enabledId',
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|enabledName', sources: [left, enabled]},
        });
    });

    test('tests mergeSettings', () => {
        const right = { id: 'right', enabled: false };
        const left = { id: 'left', enabled: true };
        expect(mergeSettings({}, right)).toEqual(right);
        expect(mergeSettings(left, {})).toEqual(left);
        expect(mergeSettings(left, right)).toEqual({
            enabled: right.enabled,
            name: '|',
            id: [left.id, right.id].join('|'),
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|right', sources: [left, right]},
        });
    });

    test('tests mergeSettings', () => {
        expect(mergeSettings({enabled: true}, {enabled: false})).toEqual({
            enabled: false,
            name: '|',
            id: '|',
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|right', sources: [{enabled: true}, {enabled: false}]},
        });
    });

    test('tests mergeSettings when left/right are the same', () => {
        expect(mergeSettings(_defaultSettings, _defaultSettings)).toBe(_defaultSettings);
    });

    test('tests mergeSettings when lefts are the same', () => {
        const base = mergeSettings(_defaultSettings, {});
        const setting1 = mergeSettings(base, {});
        const setting2 = mergeSettings(base, setting1);
        expect(setting2).toBe(setting1);

        const setting3 = mergeSettings(_defaultSettings, setting1);
        expect(setting3).toBe(setting1);
    });

    test('tests mergeSettings when rights are the same', () => {
        const base = mergeSettings(_defaultSettings, { id: 'right' });
        const setting1 = mergeSettings({ id: 'setting1' }, base);
        const setting2 = mergeSettings(setting1, base);
        expect(setting2).toBe(setting1);

        const setting3 = mergeSettings(_defaultSettings, setting1);
        expect(setting3).not.toBe(setting1);

        const setting4 = mergeSettings(setting3, base);
        expect(setting4).toBe(setting3);
    });

    test('tests loading a missing cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-missing.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toBeUndefined();
    });

    test('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-import.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
    });

    test('tests loading a cSpell.json with multiple imports file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-imports.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
        expect(settings.words).toEqual(expect.arrayContaining(['imports']));
        // cspell:word leuk
        expect(settings.words).toEqual(expect.arrayContaining(['leuk']));
    });

    test('makes sure global settings is an object', () => {
        const settings = getGlobalSettings();
        expect(Object.keys(settings)).not.toHaveLength(0);
        const merged = mergeSettings(getDefaultSettings(), getGlobalSettings());
        expect(Object.keys(merged)).not.toHaveLength(0);
    });

    test('verify clearing the file cache works', () => {
        mergeSettings(getDefaultSettings(), getGlobalSettings());
        expect(getCachedFileSize()).toBeGreaterThan(0);
        clearCachedFiles();
        expect(getCachedFileSize()).toBe(0);
    });

    test('test the loaded defaults contain expected settings', () => {
        const settings = getDefaultSettings();
        const sources = getSources(settings);
        const sourceNames = sources
            .map(s => s.name || '?');
        expect(sourceNames).toEqual(expect.arrayContaining([_defaultSettings.name!]));
    });
});

describe('Validate Overrides', () => {
    test('tests  checkFilenameMatchesGlob', () => {
        const tests = [
            { f: 'nested/dir/spell.test.ts', g: 'nested/**', e: true },
            { f: 'nested/dir/spell.test.ts', g: 'nested', e: false },
            { f: 'nested/dir/spell.test.ts', g: '*.ts', e: true },
            { f: 'nested/dir/spell.test.ts', g: '**/*.ts', e: true },
            { f: 'nested/dir/spell.test.ts', g: ['**/*.ts'], e: true },
            { f: 'nested/dir/spell.test.ts', g: ['**/dir/**/*.ts'], e: true },
            { f: 'nested/dir/spell.test.js', g: ['**/*.ts'], e: false },
            { f: 'nested/dir/spell.test.js', g: ['*.ts', '*.test.js'], e: true },
            { f: '/cspell-dicts/nl_NL/Dutch.txt', g: '**/nl_NL/**', e: true },
        ];

        tests.forEach(({f, g, e}) => // f: ${f}, g: ${g}, e: ${e}
        expect(checkFilenameMatchesGlob(f, g)).toBe(e));
    });

    test('test calcOverrideSettings', () => {
        interface Test { f: string; e: [keyof CSpellUserSettings, string][]; }
        const tests: Test[] = [
            { f: 'nested/dir/spell.test.ts', e: [['languageId', 'typescript']]},
        ];

        tests.forEach(({f, e}) => {
            const r = calcOverrideSettings(sampleSettings, f);
            e.forEach(([k, v]) => expect(r[k]).toBe(v));
        });
    });
});


const sampleSettings: CSpellUserSettings = {
    language: 'en',
    languageId: 'plaintext',
    overrides: [
        {
            filename: '**/*.ts',
            languageId: 'typescript',
        },
        {
            filename: '**/*.lex',
            languageId: 'lex',
        },
        {
            filename: '**/NL/*.txt',
            language: 'en,nl',
        },
    ],
};
