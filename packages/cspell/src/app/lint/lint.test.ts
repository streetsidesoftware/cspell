import * as path from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { CheckFailed } from '../app.mjs';
import { environmentKeys } from '../environment.js';
import { pathPackageRoot } from '../test/test.helper.js';
import { InMemoryReporter } from '../util/InMemoryReporter.js';
import { runLint } from './lint.js';
import { LintRequest } from './LintRequest.js';

const root = pathPackageRoot;
const samples = path.resolve(root, 'samples');
const latexSamples = path.resolve(samples, 'latex');
const failFastSamples = path.resolve(samples, 'fail-fast');
const hiddenSamples = path.resolve(samples, 'hidden-test');
const filesToCheck = path.resolve(root, 'fixtures/features/file-list/files-to-check.txt');
const filesToCheckWithMissing = path.resolve(root, 'fixtures/features/file-list/files-to-check-missing.txt');
const configSamples = path.resolve(samples, 'config');

// console.error('%o', {
//     root,
//     samples,
//     filesToCheckWithMissing,
// });

const oc = <T>(obj: T) => expect.objectContaining(obj);
const j = path.join;

describe('Linter Validation Tests', () => {
    test('globs on the command line override globs in the config.', async () => {
        const options = { root: latexSamples };
        const reporter = new InMemoryReporter();
        const rWithoutFiles = await runLint(new LintRequest([], options, reporter));
        expect(rWithoutFiles.files).toBe(4);
        const rWithFiles = await runLint(new LintRequest(['**/ebook.tex'], options, reporter));
        expect(rWithFiles.files).toBe(1);
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
