import * as path from 'node:path';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { CheckFailed } from '../app.mjs';
import { environmentKeys } from '../environment.js';
import { pathPackageRoot } from '../test/test.helper.js';
import { readConfig } from '../util/fileHelper.js';
import { InMemoryReporter } from '../util/InMemoryReporter.js';
import { runLint } from './lint.js';
import { LintRequest } from './LintRequest.js';

const root = pathPackageRoot;
const samples = path.resolve(root, 'samples');
const latexSamples = path.resolve(samples, 'latex');
const environmentSamples = path.resolve(samples, 'environment_config');
const failFastSamples = path.resolve(samples, 'fail-fast');
const hiddenSamples = path.resolve(samples, 'hidden-test');
const fixtures = path.resolve(root, 'fixtures');
const features = path.resolve(fixtures, 'features');
const filesToCheck = path.resolve(features, 'file-list/files-to-check.txt');
const filesToCheckWithMissing = path.resolve(root, 'fixtures/features/file-list/files-to-check-missing.txt');
const configSamples = path.resolve(samples, 'config');

const oc = <T>(obj: T) => expect.objectContaining(obj);
const j = path.join;

describe('Linter Validation Tests', () => {
    afterEach(() => {
        delete process.env[environmentKeys.CSPELL_CONFIG_PATH];
        delete process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH];
    });

    test('globs on the command line override globs in the config.', async () => {
        const options = { root: latexSamples };
        const reporter = new InMemoryReporter();
        const rWithoutFiles = await runLint(new LintRequest([], options, reporter));
        expect(rWithoutFiles.files).toBe(4);
        const rWithFiles = await runLint(new LintRequest(['**/ebook.tex'], options, reporter));
        expect(rWithFiles.files).toBe(1);
    });

    test('uses CSPELL_CONFIG_PATH as fallback when config not provided', async () => {
        const options = { root: environmentSamples };
        const reporter = new InMemoryReporter();
        const customConfig = j(environmentSamples, 'cspell.custom.json');

        process.env[environmentKeys.CSPELL_CONFIG_PATH] = customConfig;

        const result = await runLint(new LintRequest(['**/*.txt'], options, reporter));
        expect(result.errors).toBe(0);
        expect(result.files).toBe(1);
        expect(result.issues).toBe(7);
    });

    test('falls back to CSPELL_DEFAULT_CONFIG_PATH when no config is set', async () => {
        const options = { root: environmentSamples };
        const reporter = new InMemoryReporter();
        const defaultConfig = j(environmentSamples, 'cspell.default.json');

        process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH] = defaultConfig;

        const result = await runLint(new LintRequest(['**/*.tex'], options, reporter));
        expect(result.errors).toBe(0);
        expect(result.files).toBeGreaterThan(0);
        expect(result.issues).toBe(2);
    });

    test('throws an error when the specified config file does not exist', async () => {
        const rootConfig = j(environmentSamples, 'nonexistent.json');

        process.env[environmentKeys.CSPELL_CONFIG_PATH] = rootConfig;
        process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH] = rootConfig;

        const readConfigResult = await readConfig(undefined, environmentSamples);

        expect(readConfigResult.source).toBe(rootConfig);

        const resultConfig = readConfigResult.config as any;
        expect(resultConfig.__importRef.error).toBeTruthy();
        expect(resultConfig.__importRef.error).toBeInstanceOf(Error);
        expect(resultConfig.__importRef.error.message).toContain('Failed to read config file');

        const options = { root: environmentSamples };
        const reporter = new InMemoryReporter();

        const result = await runLint(new LintRequest(['**/*.txt'], options, reporter));
        expect(result.files).toBe(0);
        expect(result.errors).toBe(1);
        expect(result.issues).toBe(0);
    });

    test('handles malformed config file gracefully', async () => {
        const malformedPath = j(samples, 'cspell-bad.json');
        process.env[environmentKeys.CSPELL_CONFIG_PATH] = malformedPath;
        process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH] = malformedPath;

        const result = await readConfig(undefined, samples);
        const resultConfig = result.config;

        expect(result.source).toBe(malformedPath);
        expect(resultConfig).toHaveProperty('id', 'Invalid JSON');
        expect(resultConfig).toHaveProperty('name', 'Trailing comma');
        expect(resultConfig).toHaveProperty('__importRef');
    });

    const optionsRootCSpellJson = { root, config: j(root, 'cspell.json') };

    // cspell:ignore Tufte checkedd
    test.each`
        files               | options                                                                                                | expectedRunResult              | expectedReport
        ${[]}               | ${{ root: latexSamples }}                                                                              | ${oc({ errors: 0, files: 4 })} | ${oc({ errorCount: 0, errors: [], issues: [oc({ text: 'Tufte' })] })}
        ${['*.txt']}        | ${{ root: failFastSamples }}                                                                           | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: oc({ length: 2 }) })}
        ${['*.txt']}        | ${{ root: failFastSamples, config: j(samples, 'fail-fast/fail-fast-cspell.json') }}                    | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: oc({ length: 1 }) })}
        ${['*.txt']}        | ${{ root: failFastSamples, failFast: true }}                                                           | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: oc({ length: 1 }) })}
        ${['*.txt']}        | ${{ root: failFastSamples, failFast: false, config: j(samples, 'fail-fast/fail-fast-cspell.json') }}   | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: oc({ length: 2 }) })}
        ${['**/ebook.tex']} | ${{ root: latexSamples }}                                                                              | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/ebook.tex']} | ${{ root: latexSamples, gitignore: true }}                                                             | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples }}                                                                             | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples, dot: true }}                                                                  | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: false }}                                                                 | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples }}                                                                             | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: true }}                                                                  | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**']}           | ${{ root: samples, config: j(samples, 'cspell-not-found.json') }}                                      | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
        ${['**']}           | ${{ root: samples, config: j(samples, 'linked/cspell-import-missing.json') }}                          | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
        ${['**/ebook.tex']} | ${{ root: samples, config: j(samples, 'cspell-missing-dict.json') }}                                   | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/ebook.tex']} | ${{ root: samples, config: j(samples, 'linked/cspell-import.json') }}                                  | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck], dot: true }}                      | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.md']}      | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck] }}                                 | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.ts']}      | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck] }}                                 | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: ['missing-file.txt'] }}                           | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheckWithMissing] }}                      | ${oc({ errors: 0, files: 3 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheckWithMissing], mustFindFiles: true }} | ${oc({ errors: 1, files: 3 })} | ${oc({ errorCount: 1, errors: [expect.anything()], issues: [] })}
        ${["'**'"]}         | ${{ root, config: j(root, 'cspell.json'), mustFindFiles: true }}                                       | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(CheckFailed)], issues: [] })}
        ${['**']}           | ${{ root: j(configSamples, 'yaml-regexp') }}                                                           | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: [oc({ text: 'checkedd' })] })}
        ${[]}               | ${{ ...optionsRootCSpellJson, files: ['README.md', 'LICENSE'], dot: true }}                            | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['*.md']}         | ${{ ...optionsRootCSpellJson, files: ['README.md', 'LICENSE'], dot: true }}                            | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ ...optionsRootCSpellJson, files: ['README.md', 'missing.txt'], dot: true, mustFindFiles: false }}  | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ ...optionsRootCSpellJson, files: ['README.md', 'missing.txt'], dot: true, mustFindFiles: true }}   | ${oc({ errors: 1, files: 2 })} | ${oc({ errorCount: 1, errors: [expect.anything()], issues: [] })}
        ${[]}               | ${{ ...optionsRootCSpellJson, files: ['../../README.md'], dot: true }}                                 | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${[]}               | ${{ ...optionsRootCSpellJson, files: ['../../resources/patreon.png' /* skip binary */], dot: true }}   | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/*.md']}      | ${{ root: './fixtures/issue-6025', config: './fixtures/issue-6025/nested/cspell.config.yaml' }}        | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
    `('runLint $files $options', async ({ files, options, expectedRunResult, expectedReport }) => {
        const reporter = new InMemoryReporter();
        const runResult = await runLint(new LintRequest(files, options, reporter));
        expect(report(reporter)).toEqual(expectedReport);
        expect(runResult).toEqual(expectedRunResult);
        expect(runResult).toEqual(reporter.runResult);
    });

    test.each`
        files | options
        ${[]} | ${{ root: latexSamples }}
    `('runLint $files $options', async ({ files, options }) => {
        const reporter = new InMemoryReporter();
        process.env[environmentKeys.CSPELL_ENABLE_DICTIONARY_LOGGING] = 'true';
        process.env[environmentKeys.CSPELL_ENABLE_DICTIONARY_LOG_FILE] = 'stdout';
        process.env[environmentKeys.CSPELL_ENABLE_DICTIONARY_LOG_FIELDS] = 'word, value';
        const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
        const runResult = await runLint(new LintRequest(files, { ...options }, reporter));
        expect(runResult).toEqual(reporter.runResult);
        expect(stdout).toHaveBeenCalledOnce();
        expect(stdout.mock.calls.map(([data]) => data).join('')).toMatchFileSnapshot(
            './__snapshots__/logging/dictionary-logging.csv',
        );
    });
});

function report(reporter: InMemoryReporter) {
    const { issues, errorCount, errors } = reporter;
    return { issues, errorCount, errors };
}

function mockWrite(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
function mockWrite(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
function mockWrite(
    _data: unknown,
    encodingOrCb?: BufferEncoding | ((err?: Error) => void),
    cb?: (err?: Error) => void,
) {
    if (typeof encodingOrCb === 'function') {
        cb = encodingOrCb;
    }
    cb?.();
    return true;
}
