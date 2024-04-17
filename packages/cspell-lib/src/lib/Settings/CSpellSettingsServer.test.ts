import * as path from 'node:path';

import type { CSpellUserSettings } from '@cspell/cspell-types';
import type { CSpellConfigFile } from 'cspell-config-lib';
import { CSpellConfigFileInMemory } from 'cspell-config-lib';
import { describe, expect, test } from 'vitest';

import { pathPackageRoot, pathPackageSamples } from '../../test-util/test.locations.cjs';
import { createCSpellSettingsInternal as csi } from '../Models/CSpellSettingsInternalDef.js';
import { toURL } from '../util/url.js';
import { calcOverrideSettings } from './calcOverrideSettings.js';
import { checkFilenameMatchesGlob } from './checkFilenameMatchesGlob.js';
import { getDefaultConfigLoader } from './Controller/configLoader/defaultConfigLoader.js';
import {
    __testing__ as __configLoader_testing__,
    clearCachedSettingsFiles,
    extractImportErrors,
    getCachedFileSize,
    getGlobalSettings,
    loadConfig,
    readSettings,
    readSettingsFiles,
} from './Controller/configLoader/index.js';
import type { CSpellSettingsWST } from './Controller/configLoader/types.js';
import { getMergeStats, getSources, mergeSettings } from './CSpellSettingsServer.js';
import { _defaultSettings, getDefaultBundledSettingsAsync } from './DefaultSettings.js';

const samplesDir = pathPackageSamples;
const pathSrc = path.join(pathPackageRoot, 'src');
const oc = expect.objectContaining;

describe('Validate CSpellSettingsServer', () => {
    test('tests mergeSettings with conflicting "name"', () => {
        const left = csi({ name: 'Left' });
        const right = csi({ name: 'Right' });
        expect(mergeSettings(left, right)).toEqual(
            csi({
                enabledLanguageIds: [],
                source: { name: 'merged', sources: [left, right] },
            }),
        );
    });

    test('tests mergeSettings with conflicting "id"', () => {
        const left = { id: 'left' };
        const enabled = { id: 'enabledId', name: 'enabledName', enabled: true };
        expect(mergeSettings(left, enabled)).toEqual(
            csi({
                enabled: true,
                enabledLanguageIds: [],
                source: { name: 'merged', sources: [csi(left), csi(enabled)] },
            }),
        );
    });

    test('tests mergeSettings with conflicting "enabled"', () => {
        const right = csi({ id: 'right', enabled: false });
        const left = csi({ id: 'left', enabled: true });
        expect(mergeSettings({}, right)).toEqual(right);
        expect(mergeSettings(left, {})).toEqual(left);
        expect(mergeSettings(left, right)).toEqual(
            csi({
                enabled: right.enabled,
                enabledLanguageIds: [],
                source: { name: 'merged', sources: [left, right] },
            }),
        );
    });

    test('tests mergeSettings with inline object', () => {
        const a = { enabled: true };
        const b = { enabled: false };
        expect(mergeSettings(a, b)).toEqual(
            csi({
                enabled: false,
                enabledLanguageIds: [],
                source: { name: 'merged', sources: [csi(a), csi(b)] },
            }),
        );
    });

    test('tests mergeSettings with ignorePaths, files, and overrides', () => {
        const left = csi({
            id: 'left',
            files: ['left/**/*.*'],
            ignorePaths: ['node_modules'],
            overrides: [
                {
                    filename: '*.ts',
                    dictionaries: ['ts-extra'],
                },
            ],
        });
        const right = csi({
            id: 'right',
            enabled: true,
            files: ['right/**/*.*'],
            overrides: [{ filename: '*.jsxx', languageId: 'javascript' }], // cspell:ignore jsxx
        });
        expect(mergeSettings({}, right)).toEqual(right);
        expect(mergeSettings(left, {})).toEqual(left);
        expect(mergeSettings(left, right)).toEqual(
            csi({
                enabled: right.enabled,
                enabledLanguageIds: [],
                files: left.files?.concat(right.files || []),
                ignorePaths: left.ignorePaths?.concat(right.ignorePaths || []),
                overrides: left.overrides?.concat(right.overrides || []),
                source: { name: 'merged', sources: [left, right] },
            }),
        );
    });

    test('tests mergeSettings with ignorePaths, files, and overrides compatibility', () => {
        const left = csi({
            id: 'left',
            files: ['left/**/*.*'],
            ignorePaths: ['node_modules'],
            overrides: [
                {
                    filename: '*.ts',
                    dictionaries: ['ts-extra'],
                },
            ],
        });
        const right = csi({
            id: 'right',
            version: '0.1',
            enabled: true,
            files: ['right/**/*.*'],
            ignorePaths: ['node_modules'],
            overrides: [{ filename: '*.jsxx', languageId: 'javascript' }], // cspell:ignore jsxx
        });
        expect(mergeSettings({}, right)).toEqual(right);
        expect(mergeSettings(left, {})).toEqual(left);
        expect(mergeSettings(left, right)).toEqual(
            csi({
                enabled: right.enabled,
                version: right.version,
                enabledLanguageIds: [],
                files: left.files?.concat(right.files || []),
                ignorePaths: right.ignorePaths,
                overrides: right.overrides,
                source: { name: 'merged', sources: [left, right] },
            }),
        );
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

    test.each`
        left                                              | right                                              | expected
        ${{}}                                             | ${{}}                                              | ${csi({})}
        ${{ words: null }}                                | ${{}}                                              | ${csi({})}
        ${{}}                                             | ${{ words: null }}                                 | ${csi({})}
        ${{ dictionaries: ['a'] }}                        | ${{ dictionaries: ['b'] }}                         | ${oc(csi({ dictionaries: ['a', 'b'] }))}
        ${{ features: {} }}                               | ${{}}                                              | ${oc(csi({ features: {} }))}
        ${{ features: { 'weighted-suggestions': true } }} | ${{}}                                              | ${oc(csi({ features: { 'weighted-suggestions': true } }))}
        ${{ features: { 'weighted-suggestions': true } }} | ${{ features: { 'weighted-suggestions': false } }} | ${oc(csi({ features: { 'weighted-suggestions': false } }))}
        ${{ features: { 'weighted-suggestions': true } }} | ${{ features: { 'new-feature': true } }}           | ${oc({ features: { 'weighted-suggestions': true, 'new-feature': true } })}
    `('mergeSettings $left with $right', ({ left, right, expected }) => {
        const merged = mergeSettings(left, right);
        expect(merged).toEqual(expected);
    });

    test.each`
        filename                                              | relativeTo   | refFilename
        ${rpr('./cspell.config.json')}                        | ${undefined} | ${rpr('./cspell.config.json')}
        ${rpr('./cspell.config.json')}                        | ${pathSrc}   | ${rpr('./cspell.config.json')}
        ${'@cspell/cspell-bundled-dicts/cspell-default.json'} | ${pathSrc}   | ${require.resolve('@cspell/cspell-bundled-dicts/cspell-default.json')}
        ${'@cspell/cspell-bundled-dicts/cspell-default.json'} | ${undefined} | ${require.resolve('@cspell/cspell-bundled-dicts/cspell-default.json')}
    `('tests readSettings $filename $relativeTo', async ({ filename, relativeTo, refFilename }) => {
        const settings = await readSettings(filename, relativeTo);
        expect(settings.__importRef?.filename).toBe(refFilename);
        expect(settings.__importRef?.error).toBeUndefined();
        expect(settings.import).toBeUndefined();
    });

    test('tests loading project cspell.json file', async () => {
        const filename = path.join(pathPackageSamples, 'linked/cspell-missing.json');
        const settings = await readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toBeUndefined();
    });

    test('tests loading a cSpell.json file', async () => {
        const filename = path.join(pathPackageSamples, 'linked/cspell-import.json');
        const settings = await readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
    });

    test('readSettingsFiles cSpell.json', async () => {
        const filename = path.join(pathPackageSamples, 'linked/cspell-import.json');
        const settings = await readSettingsFiles([filename]);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
    });

    test('tests loading a cSpell.json with multiple imports file', async () => {
        const filename = path.join(pathPackageSamples, 'linked/cspell-imports.json');
        const settings = await readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
        expect(settings.words).toEqual(expect.arrayContaining(['imports']));
        // cspell:word leuk
        expect(settings.words).toEqual(expect.arrayContaining(['leuk']));
    });

    test('tests loading a cSpell.json with a missing import file', async () => {
        const filename = path.join(pathPackageSamples, 'linked/cspell-import-missing.json');
        const settings = await readSettings(filename);
        expect(settings.__importRef?.filename).toBe(path.resolve(filename));
        expect(settings.__imports?.size).toBe(2);
        const errors = extractImportErrors(settings);
        expect(errors).toHaveLength(1);
        expect(errors.map((ref) => ref.error.toString())).toContainEqual(
            expect.stringMatching('intentionally-missing-file.json'),
        );
        expect(errors.map((ref) => ref.error.toString())).toContainEqual(expect.stringMatching('Failed to'));
    });

    test('makes sure global settings is an object', async () => {
        const settings = getGlobalSettings();
        expect(Object.keys(settings)).not.toHaveLength(0);
        const merged = mergeSettings(await getDefaultBundledSettingsAsync(), await getGlobalSettings());
        expect(Object.keys(merged)).not.toHaveLength(0);
    });

    test('verify clearing the file cache works', async () => {
        mergeSettings(await getDefaultBundledSettingsAsync(), await getGlobalSettings());
        expect(getCachedFileSize()).toBeGreaterThan(0);
        clearCachedSettingsFiles();
        expect(getCachedFileSize()).toBe(0);
    });

    test('the loaded defaults contain expected settings', async () => {
        const settings = await getDefaultBundledSettingsAsync();
        const sources = getSources(settings);
        const sourceNames = sources.map((s) => s.name || '?');
        expect(sourceNames).toEqual(expect.arrayContaining([_defaultSettings.name]));
    });

    test('loading circular imports (readSettings)', async () => {
        const configFile = path.join(samplesDir, 'linked/cspell.circularA.json');
        const config = await readSettings(configFile);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules',
                    root: path.dirname(configFile),
                    source: configFile,
                },
            ]),
        );
        const errors = extractImportErrors(config);
        expect(errors).toEqual([]);

        const sources = getSources(config);
        expect(sources.length).toBe(3);
    });

    test('loading circular imports (loadConfig)', async () => {
        const configFile = path.join(samplesDir, 'linked/cspell.circularA.json');
        const config = await loadConfig(configFile);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules',
                    root: path.dirname(configFile),
                    source: configFile,
                },
            ]),
        );
        const errors = extractImportErrors(config);
        expect(errors).toEqual([]);

        const sources = getSources(config);
        expect(sources.length).toBe(3);
    });

    test('getMergeStats', () => {
        const stats = getMergeStats();
        expect(stats).toHaveProperty('cacheMergeListUnique');
    });
});

describe('Validate Overrides', () => {
    test.each`
        file                               | glob                                    | expected
        ${'nested/dir/spell.test.ts'}      | ${'nested/**'}                          | ${false /* nested/** tests against the current dir not `samples` */}
        ${'nested/dir/spell.test.ts'}      | ${{ glob: 'nested/**', root: rs('.') }} | ${true /* setting the root to `samples` will allow this to be true. */}
        ${'nested/dir/spell.test.ts'}      | ${'nested'}                             | ${true}
        ${'nested/dir/spell.test.ts'}      | ${'*.ts'}                               | ${true}
        ${'nested/dir/spell.test.ts'}      | ${'**/*.ts'}                            | ${true}
        ${'nested/dir/spell.test.ts'}      | ${['**/*.ts']}                          | ${true}
        ${'nested/dir/spell.test.ts'}      | ${['**/dir/**/*.ts']}                   | ${true}
        ${'nested/dir/spell.test.js'}      | ${['**/*.ts']}                          | ${false}
        ${'nested/dir/spell.test.js'}      | ${['*.ts', '*.test.js']}                | ${true}
        ${'/cspell-dicts/nl_NL/Dutch.txt'} | ${'**/nl_NL/**'}                        | ${true /* the file is a root filename but the glob is global */}
        ${'/cspell-dicts/nl_NL/Dutch.txt'} | ${'/**/nl_NL/**'}                       | ${false /* the file is a root filename */}
        ${'cspell-dicts/nl_NL/Dutch.txt'}  | ${'**/nl_NL/**'}                        | ${true}
    `('checkFilenameMatchesGlob "$file" against "$glob" expect: $expected', ({ file, glob, expected }) => {
        file = rs(file);
        expect(checkFilenameMatchesGlob(file, glob)).toBe(expected);
    });

    test.each`
        file                          | expected
        ${'nested/dir/spell.test.ts'} | ${{ languageId: 'typescript' }}
        ${'nested/docs/NL/myDoc.lex'} | ${{ languageId: 'lex', language: 'en' }}
        ${'nested/docs/NL/myDoc.txt'} | ${{ languageId: 'plaintext', language: 'en,nl' }}
    `('calcOverrideSettings $file expected $expected', ({ file, expected }) => {
        file = rs(file);
        const r = calcOverrideSettings(sampleSettings, file);
        expect(r).toEqual(expect.objectContaining(expected));
    });
});

/**
 * resolve relative to samples
 * @param parts - path segments
 * @returns
 */
function rs(...parts: string[]): string {
    return path.resolve(pathPackageSamples, ...parts);
}

/**
 * resolve relative to package root
 * @param parts - path segments
 * @returns
 */
function rpr(...parts: string[]): string {
    return path.resolve(pathPackageRoot, ...parts);
}

const rawSampleSettings: CSpellUserSettings = {
    language: 'en',
    languageId: 'plaintext',
    ignorePaths: ['node_modules'],
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

const sampleConfig = cf(rawSampleSettings);
// const sampleRawSettings = configToRawSettings(sampleConfig);
const sampleSettings = await getDefaultConfigLoader().mergeConfigFileWithImports(sampleConfig, {});

function cf(settings: CSpellSettingsWST, url: URL | string = import.meta.url): CSpellConfigFile {
    return new CSpellConfigFileInMemory(toURL(url), settings);
}
