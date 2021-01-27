import {
    mergeSettings,
    readSettings,
    getGlobalSettings,
    clearCachedSettingsFiles,
    getCachedFileSize,
    checkFilenameMatchesGlob,
    calcOverrideSettings,
    getSources,
    extractImportErrors,
    searchForConfig,
    loadConfig,
    ImportFileRefWithError,
    readRawSettings,
} from './CSpellSettingsServer';
import { getDefaultSettings, _defaultSettings } from './DefaultSettings';
import { CSpellSettingsWithSourceTrace, CSpellUserSettings } from './CSpellSettingsDef';
import * as path from 'path';

const samplesDir = path.resolve(path.join(__dirname, '../../samples'));
const samplesSrc = path.join(samplesDir, 'src');

jest.mock('../util/logger');

describe('Validate CSpellSettingsServer', () => {
    test('tests mergeSettings with conflicting "name"', () => {
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
            source: { name: 'Left|Right', sources: [left, right] },
        });
    });

    test('tests mergeSettings with conflicting "id"', () => {
        const left = { id: 'left' };
        const enabled = { id: 'enabledId', name: 'enabledName', enabled: true };
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
            source: { name: 'left|enabledName', sources: [left, enabled] },
        });
    });

    test('tests mergeSettings with conflicting "enabled"', () => {
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
            source: { name: 'left|right', sources: [left, right] },
        });
    });

    test('tests mergeSettings with inline object', () => {
        expect(mergeSettings({ enabled: true }, { enabled: false })).toEqual({
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
            source: { name: 'left|right', sources: [{ enabled: true }, { enabled: false }] },
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
        const filename = path.join(__dirname, '..', '..', 'cSpell.json');
        const settings = readSettings(filename);
        expect(settings.__importRef?.filename).toBe(path.resolve(filename));
        expect(settings.__importRef?.error).toBeUndefined();
        expect(settings.import).toBeUndefined();
    });

    test('tests loading project cspell.json file', () => {
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

    test('tests loading a cSpell.json with a missing import file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-import-missing.json');
        const settings = readSettings(filename);
        expect(settings.__importRef?.filename).toBe(path.resolve(filename));
        expect(settings.__imports?.size).toBe(2);
        const errors = extractImportErrors(settings);
        expect(errors).toHaveLength(1);
        expect(errors.map((ref) => ref.error.toString())).toContainEqual(
            expect.stringMatching('intentionally-missing-file.json')
        );
        expect(errors.map((ref) => ref.error.toString())).toContainEqual(expect.stringMatching('Failed to read'));
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
        clearCachedSettingsFiles();
        expect(getCachedFileSize()).toBe(0);
    });

    test('the loaded defaults contain expected settings', () => {
        const settings = getDefaultSettings();
        const sources = getSources(settings);
        const sourceNames = sources.map((s) => s.name || '?');
        expect(sourceNames).toEqual(expect.arrayContaining([_defaultSettings.name]));
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

        tests.forEach((
            { f, g, e } // f: ${f}, g: ${g}, e: ${e}
        ) => expect(checkFilenameMatchesGlob(f, g)).toBe(e));
    });

    test('calcOverrideSettings', () => {
        interface Test {
            f: string;
            e: [keyof CSpellUserSettings, string][];
        }
        const tests: Test[] = [{ f: 'nested/dir/spell.test.ts', e: [['languageId', 'typescript']] }];

        tests.forEach(({ f, e }) => {
            const r = calcOverrideSettings(sampleSettings, f);
            e.forEach(([k, v]) => expect(r[k]).toBe(v));
        });
    });
});

describe('Validate search/load config files', () => {
    function importError(filename: string): ImportFileRefWithError {
        return {
            filename,
            error: new Error(`Failed to resolve file: "${filename}"`),
        };
    }

    function readError(filename: string): ImportFileRefWithError {
        return {
            filename,
            error: new Error(`Failed to read config file: "${filename}"`),
        };
    }

    function cfg(
        filename: string | ImportFileRefWithError,
        values: CSpellSettingsWithSourceTrace = {}
    ): CSpellSettingsWithSourceTrace {
        const __importRef = typeof filename === 'string' ? { filename, error: undefined } : filename;
        return {
            __importRef,
            ...values,
        };
    }

    function s(filename: string): string {
        return relSamples(filename);
    }

    interface TestSearchFrom {
        dir: string;
        expectedConfig: CSpellSettingsWithSourceTrace;
    }

    test.each`
        dir                         | expectedConfig
        ${samplesSrc}               | ${cfg(s('.cspell.json'))}
        ${s('bug-fixes/bug345.ts')} | ${cfg(s('bug-fixes/cspell.json'))}
        ${s('linked')}              | ${cfg(s('linked/cspell.config.js'))}
        ${s('yaml-config')}         | ${cfg(s('yaml-config/cspell.yaml'), { id: 'Yaml Example Config' })}
    `('Search from $dir', async ({ dir, expectedConfig }: TestSearchFrom) => {
        const searchResult = await searchForConfig(dir);
        expect(searchResult).toEqual(expectedConfig ? expect.objectContaining(expectedConfig) : undefined);
        if (searchResult?.__importRef) {
            const loadResult = await loadConfig(searchResult.__importRef?.filename);
            expect(loadResult).toEqual(searchResult);
        }
    });

    interface TestLoadConfig {
        file: string;
        expectedConfig: CSpellSettingsWithSourceTrace;
    }

    test.each`
        file                               | expectedConfig
        ${samplesSrc}                      | ${cfg(importError(samplesSrc))}
        ${s('bug-fixes')}                  | ${cfg(importError(s('bug-fixes')))}
        ${s('linked/cspell.config.js')}    | ${cfg(s('linked/cspell.config.js'))}
        ${s('js-config/cspell.config.js')} | ${cfg(s('js-config/cspell.config.js'))}
    `('Load from $file', async ({ file, expectedConfig }: TestLoadConfig) => {
        const searchResult = await loadConfig(file);
        expect(searchResult).toEqual(expectedConfig ? expect.objectContaining(expectedConfig) : undefined);
    });

    test.each`
        file                                  | expectedConfig
        ${samplesSrc}                         | ${cfg(readError(samplesSrc))}
        ${s('bug-fixes')}                     | ${cfg(readError(s('bug-fixes')))}
        ${s('linked/cspell.config.js')}       | ${cfg(s('linked/cspell.config.js'), { description: 'cspell.config.js file in samples/linked', import: ['./cspell-imports.json'] })}
        ${s('js-config/cspell.config.js')}    | ${cfg(s('js-config/cspell.config.js'), { description: 'cspell.config.js file in samples/js-config' })}
        ${s('js-config/cspell-no-export.js')} | ${cfg(s('js-config/cspell-no-export.js'))}
        ${s('js-config/cspell-bad.js')}       | ${cfg(readError(s('js-config/cspell-bad.js')))}
    `('ReadRawSettings from $file', async ({ file, expectedConfig }: TestLoadConfig) => {
        const searchResult = await readRawSettings(file);
        expect(searchResult).toEqual(expectedConfig ? expect.objectContaining(expectedConfig) : undefined);
    });
});

function relSamples(file: string) {
    return path.resolve(samplesDir, file);
}

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
