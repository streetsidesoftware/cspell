import { runLint } from './lint';
import { LinterConfiguration } from '../LinterConfiguration';
import * as path from 'path';
import { InMemoryReporter } from '../util/InMemoryReporter';

const samples = path.resolve(__dirname, '../../samples');
const latexSamples = path.resolve(samples, 'latex');
const hiddenSamples = path.resolve(samples, 'hidden-test');

const oc = expect.objectContaining;

describe('Linter Validation Tests', () => {
    test('globs on the command line override globs in the config.', async () => {
        const options = { root: latexSamples };
        const reporter = new InMemoryReporter();
        const rWithoutFiles = await runLint(new LinterConfiguration([], options, reporter));
        expect(rWithoutFiles.files).toBe(4);
        const rWithFiles = await runLint(new LinterConfiguration(['**/ebook.tex'], options, reporter));
        expect(rWithFiles.files).toBe(1);
    });

    test.each`
        files               | options                                | expected
        ${[]}               | ${{ root: latexSamples }}              | ${oc({ files: 4 })}
        ${['**/ebook.tex']} | ${{ root: latexSamples }}              | ${oc({ files: 1 })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples }}             | ${oc({ files: 0 })}
        ${['**/hidden.md']} | ${{ root: hiddenSamples, dot: true }}  | ${oc({ files: 1 })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: false }} | ${oc({ files: 0 })}
        ${['**/*.md']}      | ${{ root: hiddenSamples }}             | ${oc({ files: 0 })}
        ${['**/*.md']}      | ${{ root: hiddenSamples, dot: true }}  | ${oc({ files: 2 })}
    `('runLint $files $options', async ({ files, options, expected }) => {
        const reporter = new InMemoryReporter();
        const rWithoutFiles = await runLint(new LinterConfiguration(files, options, reporter));
        expect(rWithoutFiles).toEqual(expected);
    });
});
