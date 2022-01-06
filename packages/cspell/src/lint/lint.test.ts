import * as path from 'path';
import { LintRequest } from './LintRequest';
import { InMemoryReporter } from '../util/InMemoryReporter';
import { runLint } from './lint';

const root = path.resolve(__dirname, '../..');
const samples = path.resolve(root, 'samples');
const latexSamples = path.resolve(samples, 'latex');
const hiddenSamples = path.resolve(samples, 'hidden-test');
const filesToCheck = path.resolve(root, 'fixtures/features/file-list/files-to-check.txt');

const oc = expect.objectContaining;
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

    // cspell:ignore Tufte
    test.each`
        files               | options                                                                           | expectedRunResult              | expectedReport
        ${[]}               | ${{ root: latexSamples }}                                                         | ${oc({ errors: 0, files: 4 })} | ${oc({ errorCount: 0, issues: [oc({ text: 'Tufte' })] })}
        ${['**/ebook.tex']} | ${{ root: latexSamples }}                                                         | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/ebook.tex']} | ${{ root: latexSamples, gitignore: true }}                                        | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples }}                                                        | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples, dot: true }}                                             | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: false }}                                            | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples }}                                                        | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: true }}                                             | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**']}           | ${{ root: samples, config: j(samples, 'cspell-not-found.json') }}                 | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
        ${['**']}           | ${{ root: samples, config: j(samples, 'linked/cspell-import-missing.json') }}     | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
        ${['**/ebook.tex']} | ${{ root: samples, config: j(samples, 'cspell-missing-dict.json') }}              | ${oc({ errors: 0, files: 0 })} | ${oc({ errorCount: 0, errors: [], issues: [] })}
        ${['**/ebook.tex']} | ${{ root: samples, config: j(samples, 'linked/cspell-import.json') }}             | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck], dot: true }} | ${oc({ errors: 0, files: 2 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/*.md']}      | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck] }}            | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${['**/*.ts']}      | ${{ root, config: j(root, 'cspell.json'), fileLists: [filesToCheck] }}            | ${oc({ errors: 0, files: 1 })} | ${oc({ errorCount: 0, issues: [] })}
        ${[]}               | ${{ root, config: j(root, 'cspell.json'), fileLists: ['missing-file.txt'] }}      | ${oc({ errors: 1, files: 0 })} | ${oc({ errorCount: 1, errors: [expect.any(Error)], issues: [] })}
    `('runLint $files $options', async ({ files, options, expectedRunResult, expectedReport }) => {
        const reporter = new InMemoryReporter();
        const runResult = await runLint(new LintRequest(files, options, reporter));
        expect(report(reporter)).toEqual(expectedReport);
        expect(runResult).toEqual(expectedRunResult);
        expect(runResult).toEqual(reporter.runResult);
    });
});

function report(reporter: InMemoryReporter) {
    const { issues, errorCount, errors } = reporter;
    return { issues, errorCount, errors };
}
