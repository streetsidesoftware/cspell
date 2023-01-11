import * as path from 'path';
import type { CSpellSettingsWithSourceTrace, CSpellUserSettings, ImportFileRef } from '@cspell/cspell-types';
import { URI } from 'vscode-uri';

import { logError, logWarning } from '../../../util/logger';
import { currentSettingsFileVersion, ENV_CSPELL_GLOB_ROOT } from '../../constants';
import type { ImportFileRefWithError } from '../../CSpellSettingsServer';
import { extractDependencies, getSources, mergeSettings } from '../../CSpellSettingsServer';
import { _defaultSettings, getDefaultBundledSettings } from '../../DefaultSettings';
import {
    __testing__ as __configLoader_testing__,
    clearCachedSettingsFiles,
    getCachedFileSize,
    getGlobalSettings,
    loadConfig,
    loadConfigSync,
    loadPnP,
    loadPnPSync,
    readRawSettings,
    readSettingsFiles,
    searchForConfig,
} from './configLoader';
import { extractImportErrors } from './extractImportErrors';
import { readSettings } from './readSettings';

const { normalizeCacheSettings, validateRawConfigExports, validateRawConfigVersion, getDefaultConfigLoaderInternal } =
    __configLoader_testing__;

const loader = getDefaultConfigLoaderInternal();
const normalizeSettings = loader._normalizeSettings.bind(loader);

const rootCspellLib = path.resolve(path.join(__dirname, '../../../..'));
const root = path.resolve(rootCspellLib, '../..');
const samplesDir = path.resolve(rootCspellLib, 'samples');
const samplesSrc = path.join(samplesDir, 'src');
const testFixtures = path.join(root, 'test-fixtures');
const oc = expect.objectContaining;

jest.mock('../../../util/logger');

const mockedLogError = jest.mocked(logError);
const mockedLogWarning = jest.mocked(logWarning);

describe('Validate CSpellSettingsServer', () => {
    test.each`
        filename                                              | relativeTo   | refFilename
        ${rr('cspell.config.json')}                           | ${undefined} | ${rr('cspell.config.json')}
        ${rr('cspell.config.json')}                           | ${__dirname} | ${rr('cspell.config.json')}
        ${'@cspell/cspell-bundled-dicts/cspell-default.json'} | ${__dirname} | ${require.resolve('@cspell/cspell-bundled-dicts/cspell-default.json')}
        ${'@cspell/cspell-bundled-dicts/cspell-default.json'} | ${undefined} | ${require.resolve('@cspell/cspell-bundled-dicts/cspell-default.json')}
    `('tests readSettings $filename $relativeTo', ({ filename, relativeTo, refFilename }) => {
        const settings = readSettings(filename, relativeTo);
        expect(settings.__importRef?.filename).toBe(refFilename);
        expect(settings.__importRef?.error).toBeUndefined();
        expect(settings.import).toBeUndefined();
    });

    test('tests loading project cspell.json file', () => {
        const filename = path.join(samplesDir, 'linked/cspell-missing.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toBeUndefined();
    });

    test('tests loading a cSpell.json file', () => {
        const filename = path.join(samplesDir, 'linked/cspell-import.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
    });

    test('readSettingsFiles cSpell.json', () => {
        const filename = path.join(samplesDir, 'linked/cspell-import.json');
        const settings = readSettingsFiles([filename]);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
    });

    test('tests loading a cSpell.json with multiple imports file', () => {
        const filename = path.join(samplesDir, 'linked/cspell-imports.json');
        const settings = readSettings(filename);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.words).toEqual(expect.arrayContaining(['import']));
        expect(settings.words).toEqual(expect.arrayContaining(['imports']));
        // cspell:word leuk
        expect(settings.words).toEqual(expect.arrayContaining(['leuk']));
    });

    test('tests loading a cSpell.json with a missing import file', () => {
        const filename = path.join(samplesDir, 'linked/cspell-import-missing.json');
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
        const merged = mergeSettings(getDefaultBundledSettings(), getGlobalSettings());
        expect(Object.keys(merged)).not.toHaveLength(0);
    });

    test('verify clearing the file cache works', () => {
        mergeSettings(getDefaultBundledSettings(), getGlobalSettings());
        expect(getCachedFileSize()).toBeGreaterThan(0);
        clearCachedSettingsFiles();
        expect(getCachedFileSize()).toBe(0);
    });

    test('the loaded defaults contain expected settings', () => {
        const settings = getDefaultBundledSettings();
        const sources = getSources(settings);
        const sourceNames = sources.map((s) => s.name || '?');
        expect(sourceNames).toEqual(expect.arrayContaining([_defaultSettings.name]));
    });

    test('loading circular imports (readSettings)', async () => {
        const configFile = path.join(samplesDir, 'linked/cspell.circularA.json');
        const config = readSettings(configFile);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules',
                    root: path.dirname(configFile),
                    source: configFile,
                },
            ])
        );
        const errors = extractImportErrors(config);
        expect(errors).toEqual([]);

        const sources = getSources(config);
        expect(sources.length).toBe(2);
    });
});

describe('Validate CSpellSettingsServer loadConfig', () => {
    beforeEach(() => {
        clearCachedSettingsFiles();
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
            ])
        );
        const errors = extractImportErrors(config);
        expect(errors).toEqual([]);

        const sources = getSources(config);
        expect(sources.length).toBe(2);
    });

    test('loading circular imports (loadConfigSync)', () => {
        const configFile = path.join(samplesDir, 'linked/cspell.circularA.json');
        const config = loadConfigSync(configFile);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules',
                    root: path.dirname(configFile),
                    source: configFile,
                },
            ])
        );
        const errors = extractImportErrors(config);
        expect(errors).toEqual([]);

        const sources = getSources(config);
        expect(sources.length).toBe(2);
    });
});

describe('Validate Glob resolution', () => {
    beforeEach(() => {
        delete process.env[ENV_CSPELL_GLOB_ROOT];
    });

    test('normalized settings', () => {
        expect(sampleSettings).not.toEqual(sampleSettingsV1);
        expect(sampleSettings.globRoot).not.toEqual(sampleSettingsV1.globRoot);
        expect(sampleSettings.globRoot).toBe(__dirname);
        expect(sampleSettingsV1.globRoot).toEqual('${cwd}');
        expect(sampleSettings.ignorePaths).toEqual(
            expect.arrayContaining([
                { glob: 'node_modules', root: sampleSettings.globRoot, source: sampleSettingsFilename },
            ])
        );
        expect(sampleSettingsV1.ignorePaths).toEqual(
            expect.arrayContaining([
                { glob: 'node_modules', root: sampleSettingsV1.globRoot, source: sampleSettingsFilename },
            ])
        );
    });

    test('Using ENV_CSPELL_GLOB_ROOT as __dirname', () => {
        process.env[ENV_CSPELL_GLOB_ROOT] = __dirname;
        const settingsV = normalizeSettings(rawSampleSettings, __filename, {});
        const settingsV1 = normalizeSettings(rawSampleSettingsV1, __filename, {});

        expect(settingsV).toEqual(sampleSettings);
        expect(settingsV1).not.toEqual(sampleSettingsV1);

        delete settingsV1.version;
        const { version: _, ...sample } = sampleSettings;
        expect(settingsV1).toEqual(sample);
    });

    test('Using ENV_CSPELL_GLOB_ROOT as without shared hierarchy', () => {
        process.env[ENV_CSPELL_GLOB_ROOT] = rr('samples');
        const settingsV = normalizeSettings(rawSampleSettings, __filename, {});
        const settingsV1 = normalizeSettings(rawSampleSettingsV1, __filename, {});

        expect(settingsV.version).toEqual(currentSettingsFileVersion);

        expect(settingsV1).toEqual(oc({ version: '0.1' }));
        expect(settingsV).not.toEqual(sampleSettings);
        expect(settingsV1).not.toEqual(sampleSettingsV1);

        delete settingsV1.version;
        delete settingsV.version;
        expect(settingsV1).toEqual(settingsV);
    });

    test('globs with relative globRoot', async () => {
        const configFilename = path.resolve(samplesDir, 'cspell.relative-glob-root.json');
        const configDir = path.dirname(configFilename);
        const config = await loadConfig(configFilename);

        expect(config).toEqual(
            oc({
                ignorePaths: expect.arrayContaining([
                    {
                        glob: 'node_modules',
                        root: path.resolve(configDir, '../../..'),
                        source: configFilename,
                    },
                ]),
            })
        );
    });

    test.each`
        from
        ${__dirname}
        ${undefined}
    `('globs from config file (search) $from', async ({ from }) => {
        const config = await searchForConfig(from);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules/**',
                    root: rootCspellLib,
                    source: path.join(rootCspellLib, 'cspell.config.json'),
                },
            ])
        );
    });

    test('globs from config file (readSettings)', async () => {
        const configFile = path.join(rootCspellLib, 'cspell.config.json');
        const config = readSettings(configFile);
        expect(config?.ignorePaths).toEqual(
            expect.arrayContaining([
                {
                    glob: 'node_modules/**',
                    root: rootCspellLib,
                    source: configFile,
                },
            ])
        );
    });

    test.each`
        settings                                          | file                | expected
        ${{}}                                             | ${r('cspell.json')} | ${oc({ name: 'configLoader/cspell.json' })}
        ${{ gitignoreRoot: '.' }}                         | ${r('cspell.json')} | ${oc({ name: 'configLoader/cspell.json', gitignoreRoot: [__dirname] })}
        ${{ gitignoreRoot: '..' }}                        | ${r('cspell.json')} | ${oc({ gitignoreRoot: [r('..')] })}
        ${{ gitignoreRoot: ['.', '..'] }}                 | ${r('cspell.json')} | ${oc({ gitignoreRoot: [r('.'), r('..')] })}
        ${{ reporters: ['../../../../README.md'] }}       | ${r('cspell.json')} | ${oc({ reporters: [rr('README.md')] })}
        ${{ reporters: [['../../../../README.md']] }}     | ${r('cspell.json')} | ${oc({ reporters: [[rr('README.md')]] })}
        ${{ reporters: [['../../../../README.md', {}]] }} | ${r('cspell.json')} | ${oc({ reporters: [[rr('README.md'), {}]] })}
    `('normalizeSettings $settings', ({ settings, file, expected }) => {
        expect(normalizeSettings(settings, file, {})).toEqual(expected);
    });

    test.each`
        settings                            | file                | expected
        ${{ reporters: ['./reporter.js'] }} | ${r('cspell.json')} | ${'Not found: "./reporter.js"'}
        ${{ reporters: [{}] }}              | ${r('cspell.json')} | ${'Invalid Reporter'}
        ${{ reporters: [[{}]] }}            | ${r('cspell.json')} | ${'Invalid Reporter'}
    `('normalizeSettings with Error $settings', ({ settings, file, expected }) => {
        expect(() => normalizeSettings(settings, file, {})).toThrow(expected);
    });
});

describe('Validate search/load config files', () => {
    beforeEach(() => {
        mockedLogError.mockClear();
        mockedLogWarning.mockClear();
        clearCachedSettingsFiles();
    });

    function importRefWithError(filename: string): ImportFileRefWithError {
        return {
            filename,
            error: new Error(`Failed to find config file at: "${filename}"`),
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
        const __importRef = importFileRef(filename);
        return {
            __importRef,
            ...values,
        };
    }

    /**
     * Create an ImportFileRef that has an `error` field.
     */
    function importFileRef(filenameOrRef: string | ImportFileRef | ImportFileRefWithError): ImportFileRef {
        const { filename, error } = iRef(filenameOrRef);
        return { filename, error };
    }

    /**
     * Create an ImportFileRef with an optional `error` field.
     */
    function iRef(filenameOrRef: string | ImportFileRef | ImportFileRefWithError): ImportFileRef {
        return typeof filenameOrRef === 'string' ? { filename: filenameOrRef } : filenameOrRef;
    }

    function s(filename: string): string {
        return relSamples(filename);
    }

    interface TestSearchFrom {
        dir: string;
        expectedConfig: CSpellSettingsWithSourceTrace;
        expectedImportErrors: string[];
    }

    test.each`
        dir                         | expectedConfig                                                      | expectedImportErrors
        ${samplesSrc}               | ${cfg(s('.cspell.json'))}                                           | ${[]}
        ${s('bug-fixes/bug345.ts')} | ${cfg(s('bug-fixes/cspell.json'))}                                  | ${[]}
        ${s('linked')}              | ${cfg(s('linked/cspell.config.js'))}                                | ${[]}
        ${s('yaml-config')}         | ${cfg(s('yaml-config/cspell.yaml'), { id: 'Yaml Example Config' })} | ${['cspell-imports.json']}
    `('Search from $dir', async ({ dir, expectedConfig, expectedImportErrors }: TestSearchFrom) => {
        const searchResult = await searchForConfig(dir);
        expect(searchResult).toEqual(expect.objectContaining(expectedConfig));
        if (searchResult?.__importRef) {
            const loadResult = await loadConfig(searchResult.__importRef?.filename);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(loadResult).toEqual(searchResult);
        }
        const errors = extractImportErrors(searchResult || {});
        expect(errors).toHaveLength(expectedImportErrors.length);
        expect(errors).toEqual(
            expect.arrayContaining(
                expectedImportErrors.map((filename) =>
                    expect.objectContaining({ filename: expect.stringContaining(filename) })
                )
            )
        );
    });

    test.each`
        dir                         | expectedConfig                                                      | expectedImportErrors
        ${samplesSrc}               | ${cfg(s('.cspell.json'))}                                           | ${[]}
        ${s('bug-fixes/bug345.ts')} | ${cfg(s('bug-fixes/cspell.json'))}                                  | ${[]}
        ${s('linked')}              | ${cfg(s('linked/cspell.config.js'))}                                | ${[]}
        ${s('yaml-config')}         | ${cfg(s('yaml-config/cspell.yaml'), { id: 'Yaml Example Config' })} | ${['cspell-imports.json']}
    `('Search sync check from $dir', async ({ dir, expectedConfig, expectedImportErrors }: TestSearchFrom) => {
        const searchResult = await searchForConfig(dir);
        expect(searchResult).toEqual(expect.objectContaining(expectedConfig));
        if (searchResult?.__importRef) {
            clearCachedSettingsFiles();
            const loadResult = loadConfigSync(searchResult.__importRef?.filename);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(loadResult).toEqual(searchResult);
        }
        const errors = extractImportErrors(searchResult || {});
        expect(errors).toHaveLength(expectedImportErrors.length);
        expect(errors).toEqual(
            expect.arrayContaining(
                expectedImportErrors.map((filename) =>
                    expect.objectContaining({ filename: expect.stringContaining(filename) })
                )
            )
        );
    });

    interface TestLoadConfig {
        file: string;
        expectedConfig: CSpellSettingsWithSourceTrace;
    }

    test.each`
        file                               | expectedConfig
        ${samplesSrc}                      | ${cfg(importRefWithError(samplesSrc))}
        ${s('bug-fixes')}                  | ${cfg(importRefWithError(s('bug-fixes')))}
        ${s('linked/cspell.config.js')}    | ${cfg(s('linked/cspell.config.js'))}
        ${s('js-config/cspell.config.js')} | ${cfg(s('js-config/cspell.config.js'))}
    `('Load from $file', async ({ file, expectedConfig }: TestLoadConfig) => {
        const searchResult = await loadConfig(file);
        expect(searchResult).toEqual(oc(expectedConfig));
        expect(mockedLogWarning).toHaveBeenCalledTimes(0);
        expect(mockedLogError).toHaveBeenCalledTimes(0);
    });

    test.each`
        file                               | expectedConfig
        ${samplesSrc}                      | ${cfg(importRefWithError(samplesSrc))}
        ${s('bug-fixes')}                  | ${cfg(importRefWithError(s('bug-fixes')))}
        ${s('linked/cspell.config.js')}    | ${cfg(s('linked/cspell.config.js'))}
        ${s('js-config/cspell.config.js')} | ${cfg(s('js-config/cspell.config.js'))}
    `('Load sync from $file', ({ file, expectedConfig }: TestLoadConfig) => {
        const searchResult = loadConfigSync(file);
        expect(searchResult).toEqual(oc(expectedConfig));
        expect(mockedLogWarning).toHaveBeenCalledTimes(0);
        expect(mockedLogError).toHaveBeenCalledTimes(0);
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
        expect(searchResult).toEqual(oc(expectedConfig));
        expect(mockedLogWarning).toHaveBeenCalledTimes(0);
        expect(mockedLogError).toHaveBeenCalledTimes(0);
    });

    test.each`
        file                                                   | expectedConfig
        ${path.join(testFixtures, 'issues/issue-1729/a.yaml')} | ${oc({ version: '0.2' })}
        ${path.join(testFixtures, 'issues/issue-1729/b.yaml')} | ${oc({ version: '0.2' })}
    `('ReadRawSettings from $file', async ({ file, expectedConfig }: TestLoadConfig) => {
        const searchResult = await readRawSettings(file);
        expect(searchResult).toEqual(expectedConfig);
        expect(mockedLogWarning).toHaveBeenCalledTimes(0);
        expect(mockedLogError).toHaveBeenCalledTimes(0);
    });

    test('loadPnP', async () => {
        await expect(loadPnP({}, URI.file(__dirname))).resolves.toBeUndefined();
        // Look for a pnp file from the current location, but it won't be found.
        await expect(loadPnP({ usePnP: true }, URI.file(__dirname))).resolves.toBeUndefined();
    });

    test('loadPnPSync', () => {
        expect(loadPnPSync({}, URI.file(__dirname))).toBeUndefined();
        // Look for a pnp file from the current location, but it won't be found.
        expect(loadPnPSync({ usePnP: true }, URI.file(__dirname))).toBeUndefined();
    });

    test('config needing PnP', async () => {
        const uriTestPackages = path.join(root, 'test-packages/yarn');
        const uriYarn2TestMedCspell = path.join(uriTestPackages, 'yarn2/test-yarn3-med/cspell.json');
        const result = await loadConfig(uriYarn2TestMedCspell, {});
        expect(result.dictionaries).toEqual(['medical terms']);
    });

    test.each`
        config
        ${{ version: '0.2' }}
        ${{}}
        ${{ version: undefined }}
    `('validateRawConfigVersion valid $config', ({ config }) => {
        validateRawConfigVersion(config, { filename: 'filename' });
        expect(mockedLogWarning).toHaveBeenCalledTimes(0);
        expect(mockedLogError).toHaveBeenCalledTimes(0);
    });

    test.each`
        config                  | mocked              | expected
        ${{ version: 'hello' }} | ${mockedLogError}   | ${'Unsupported config file version: "hello"\n  File: "filename"'}
        ${{ version: '0.1' }}   | ${mockedLogWarning} | ${'Legacy config file version found: "0.1", upgrade to "0.2"\n  File: "filename"'}
        ${{ version: '0.3' }}   | ${mockedLogWarning} | ${'Newer config file version found: "0.3". Supported version is "0.2"\n  File: "filename"'}
        ${{ version: 0.2 }}     | ${mockedLogError}   | ${'Unsupported config file version: "0.2", string expected\n  File: "filename"'}
        ${{ version: 0.3 }}     | ${mockedLogError}   | ${'Unsupported config file version: "0.3", string expected\n  File: "filename"'}
    `('validateRawConfigVersion $config', ({ config, mocked, expected }) => {
        validateRawConfigVersion(config, { filename: 'filename' });
        expect(mocked).toHaveBeenCalledWith(expected);
    });

    test('validateRawConfigExports', () => {
        const d = { default: {}, name: '' };
        const c: CSpellUserSettings = d;
        expect(() => validateRawConfigExports(c, { filename: 'filename' })).toThrow(
            'Module `export default` is not supported.\n  Use `module.exports =` instead.\n  File: "filename"'
        );
    });
});

describe('Validate Normalize Settings', () => {
    test.each`
        config                                           | expected
        ${{}}                                            | ${{}}
        ${{ cache: {} }}                                 | ${{ cache: {} }}
        ${{ cache: { useCache: false } }}                | ${{ cache: { useCache: false } }}
        ${{ cache: { useCache: undefined } }}            | ${{ cache: { useCache: undefined } }}
        ${{ cache: { cacheLocation: '.cache' } }}        | ${{ cache: { cacheLocation: r(root, '.cache') } }}
        ${{ cache: { cacheLocation: '${cwd}/.cache' } }} | ${{ cache: { cacheLocation: r(process.cwd(), '.cache') } }}
    `('normalizeCacheSettings', ({ config, expected }) => {
        expect(normalizeCacheSettings(config, root)).toEqual(expected);
    });
});

describe('Validate Dependencies', () => {
    test.each`
        filename                    | relativeTo   | expected
        ${rr('cspell.config.json')} | ${undefined} | ${{ configFiles: [r(root, 'cspell.json'), rr('cspell.config.json')], dictionaryFiles: [r(root, 'cspell-dict.txt'), r(root, 'cspell-ignore-words.txt')] }}
    `('tests readSettings $filename $relativeTo', ({ filename, relativeTo, expected }) => {
        const settings = readSettings(filename, relativeTo);
        const dependencies = extractDependencies(settings);
        expect(dependencies).toEqual(expected);
    });
});

function p(...parts: string[]): string {
    return path.join(...parts);
}

function r(...parts: string[]): string {
    return path.resolve(__dirname, p(...parts));
}

function rr(...parts: string[]): string {
    return path.resolve(rootCspellLib, p(...parts));
}

function relSamples(file: string) {
    return path.resolve(samplesDir, file);
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

const rawSampleSettingsV1: CSpellUserSettings = { ...rawSampleSettings, version: '0.1' };
const sampleSettingsFilename = __filename;
const sampleSettings = normalizeSettings(rawSampleSettings, sampleSettingsFilename, {});
const sampleSettingsV1 = normalizeSettings(rawSampleSettingsV1, sampleSettingsFilename, {});
