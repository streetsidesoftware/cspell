import { runLint } from './lint';
import { CSpellApplicationConfiguration } from './CSpellApplicationConfiguration';
import * as path from 'path';
import { InMemoryReporter } from './util/InMemoryReporter';

const samples = path.resolve(__dirname, '../samples');
const latexSamples = path.resolve(samples, 'latex');

describe('Linter Validation Tests', () => {
    test('globs on the command line override globs in the config.', async () => {
        const options = { root: latexSamples };
        const reporter = new InMemoryReporter();
        const rWithoutFiles = await runLint(new CSpellApplicationConfiguration([], options, reporter));
        expect(rWithoutFiles.files).toBe(4);
        const rWithFiles = await runLint(new CSpellApplicationConfiguration(['**/ebook.tex'], options, reporter));
        expect(rWithFiles.files).toBe(1);
    });
});
