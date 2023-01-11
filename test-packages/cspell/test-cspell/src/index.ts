import { assert } from 'console';
import type { CSpellReporter } from '@cspell/cspell-types';
import type { CSpellApplicationOptions, Issue, ProgressItem, RunResult } from 'cspell';
import { checkText, lint, trace } from 'cspell';
import { run } from 'cspell/dist/app';

async function test() {
    console.log('start');

    /**
     * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
     */
    const functions = [checkText, lint, trace, run];

    functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));

    const logger = new ConsoleLogger();

    const options: CSpellApplicationOptions = {};

    const result: RunResult = await lint(['*.md'], options, logger);
    assert(result.errors === 0);
    assert(result.issues === 0);
    assert(result.files === 2);

    console.log(JSON.stringify(result));

    console.log('done');
}

class ConsoleLogger implements CSpellReporter {
    log: string[] = [];
    issueCount = 0;
    errorCount = 0;
    debugCount = 0;
    infoCount = 0;
    progressCount = 0;
    issues: Issue[] = [];
    runResult: RunResult | undefined;

    issue = (issue: Issue) => {
        this.issueCount += 1;
        const { uri, row, col, text } = issue;
        console.log(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
    };

    error = (message: string, error: Error) => {
        this.errorCount += 1;
        console.error(`Error: ${message} ${error.toString()}`);
        return Promise.resolve();
    };

    info = (_message: string) => {
        this.infoCount += 1;
        // console.info(`Info: ${message}`);
    };

    debug = (_message: string) => {
        this.debugCount += 1;
        // console.debug(`Debug: ${message}`);
    };

    progress = (p: ProgressItem) => {
        this.progressCount += 1;
        console.error(`Progress: ${p.type} ${p.fileNum} ${p.fileCount} ${p.filename}`);
    };

    result = (r: RunResult) => {
        this.runResult = r;
    };
}

test();
