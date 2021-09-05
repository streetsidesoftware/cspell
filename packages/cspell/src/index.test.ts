import * as index from './index';

// Make sure the types are exported.
import { CSpellApplicationOptions } from './index';
import { CSpellReporter, Issue, ProgressFileComplete, RunResult } from '@cspell/cspell-types';

describe('Validate index.ts', () => {
    test('index', () => {
        expect(index).toBeDefined();
    });

    test('quick run', async () => {
        const appOptions: CSpellApplicationOptions = {};
        const logger = new Logger();

        const result: RunResult = await index.lint(['*.md'], appOptions, logger);

        expect(result).toEqual(
            expect.objectContaining({
                errors: 0,
                issues: 0,
            })
        );
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
