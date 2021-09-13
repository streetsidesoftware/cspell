import { CSpellReporter, Issue, ProgressFileComplete, RunResult } from '@cspell/cspell-types';

/**
 * Simple reporter for test purposes
 */
export class InMemoryReporter implements CSpellReporter {
    log: string[] = [];
    issueCount = 0;
    errorCount = 0;
    debugCount = 0;
    infoCount = 0;
    progressCount = 0;
    issues: Issue[] = [];
    runResult: RunResult | undefined;

    issue = (issue: Issue): void => {
        this.issues.push(issue);
        this.issueCount += 1;
        const { uri, row, col, text } = issue;
        this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
    };

    error = (message: string, error: Error): void => {
        this.errorCount += 1;
        this.log.push(`Error: ${message} ${error.toString()}`);
    };

    info = (message: string): void => {
        this.infoCount += 1;
        this.log.push(`Info: ${message}`);
    };

    debug = (message: string): void => {
        this.debugCount += 1;
        this.log.push(`Debug: ${message}`);
    };

    progress = (p: ProgressFileComplete): void => {
        this.progressCount += 1;
        this.log.push(`Progress: ${p.type} ${p.fileNum} ${p.fileCount} ${p.filename}`);
    };

    result = (r: RunResult): void => {
        this.runResult = r;
    };

    dump = () => ({ log: this.log, issues: this.issues, result: this.runResult });
}
