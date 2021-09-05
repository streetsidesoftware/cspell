import { runLint } from './lint';
import { CSpellApplicationConfiguration } from './CSpellApplicationConfiguration';
import { CSpellReporter, Issue, ProgressFileComplete, RunResult } from '@cspell/cspell-types';
import * as path from 'path';

const samples = path.resolve(__dirname, '../samples');
const latexSamples = path.resolve(samples, 'latex');

describe('Linter Validation Tests', () => {
    test('globs on the command line override globs in the config.', async () => {
        const options = { root: latexSamples };
        const logger = new Logger();
        const rWithoutFiles = await runLint(new CSpellApplicationConfiguration([], options, logger));
        expect(rWithoutFiles.files).toBe(4);
        const rWithFiles = await runLint(new CSpellApplicationConfiguration(['**/ebook.tex'], options, logger));
        expect(rWithFiles.files).toBe(1);
    });
});

class Logger implements CSpellReporter {
    log: string[] = [];
    issueCount = 0;
    errorCount = 0;
    debugCount = 0;
    infoCount = 0;
    progressCount = 0;
    issues: Issue[] = [];
    runResult: RunResult | undefined;

    issue = (issue: Issue) => {
        this.issues.push(issue);
        this.issueCount += 1;
        const { uri, row, col, text } = issue;
        this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
    };

    error = (message: string, error: Error) => {
        this.errorCount += 1;
        this.log.push(`Error: ${message} ${error.toString()}`);
        return Promise.resolve();
    };

    info = (message: string) => {
        this.infoCount += 1;
        this.log.push(`Info: ${message}`);
    };

    debug = (message: string) => {
        this.debugCount += 1;
        this.log.push(`Debug: ${message}`);
    };

    progress = (p: ProgressFileComplete) => {
        this.progressCount += 1;
        this.log.push(`Progress: ${p.type} ${p.fileNum} ${p.fileCount} ${p.filename}`);
    };

    result = (r: RunResult) => {
        this.runResult = r;
    };
}
