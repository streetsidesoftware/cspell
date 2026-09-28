import type { ProgressFileBegin, ProgressFileComplete } from '@cspell/cspell-types';
import { Chalk } from 'chalk';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ApplicationError } from './app.mjs';
import type { ReporterIssue } from './cli-reporter.js';
import { __testing__, checkTemplate, getReporter } from './cli-reporter.js';
import { console } from './console.js';

const { formatIssue } = __testing__;

const doc = `
This is a simple document with a bit of text.

It has more than one line.

$myPhpOffset := $row + $col;

$uri:$filename:$row:$col$padRowCol,$message,$text,$padContext,$contextLeft,$text,$contextRight,[$suggestions]

And some words to be used for some spelling issues.

There are many options.
`;

const ioChalk = { chalk: new Chalk({ level: 0 }) };

describe('cli-reporter', () => {
    test.each`
        issue                  | template                                             | expected
        ${genIssue('line')}    | ${''}                                                | ${''}
        ${genIssue('line')}    | ${'$row:$col:$text'}                                 | ${'4:21:line'}
        ${genIssue('$col')}    | ${'$row:$col:$text'}                                 | ${'6:23:$col'}
        ${genIssue('$col')}    | ${'$row:$col:$text - $contextFull'}                  | ${'6:23:$col - := $row + $col;'}
        ${genIssue('message')} | ${'$row:$col:$text - $contextFull'}                  | ${'8:36:message - adRowCol,$message,$text,$pa'}
        ${genIssue('used')}    | ${'$contextLeft:$text:$contextRight - $contextFull'} | ${'rds to be :used: for some  - rds to be used for some'}
        ${genIssue('used')}    | ${'"$contextFull"'}                                  | ${'"rds to be used for some "'}
    `('formatIssue $issue $template', ({ issue, template, expected }) => {
        expect(formatIssue(ioChalk, template, issue, 200)).toBe(expected);
    });

    test.each`
        template                                     | expected
        ${''}                                        | ${true}
        ${'{red $filename}'}                         | ${true}
        ${'{red $filename'}                          | ${new ApplicationError('Chalk template literal is missing 1 closing bracket (`}`)')}
        ${'{hello $filename}'}                       | ${new ApplicationError('Unknown Chalk style: hello')}
        ${'{green.bold.underline $file}'}            | ${new ApplicationError(`Unresolved template variable: '$file'`)}
        ${'{green.bold.underline $file}:$rows:$col'} | ${new ApplicationError(`Unresolved template variables: '$file', '$rows'`)}
    `('checkTemplate $template', ({ template, expected }) => {
        const r = checkTemplate(template);
        expect(r).toEqual(expected);
    });
});

describe('cli-reporter perf summary', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('accounts for the time before, during, and between files', async () => {
        let now = 1000;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        vi.spyOn(console.stderrChannel, 'getColorLevel').mockReturnValue(0);
        const lines: string[] = [];
        vi.spyOn(console.stderrChannel, 'write').mockImplementation((msg) => lines.push(msg));

        const reporter = getReporter({ fileGlobs: ['*'], showPerfSummary: true, summary: true, progress: false });

        now = 1100;
        reporter.progress(fileBegin(1));
        now = 1300;
        reporter.progress(fileComplete(1, 150));
        now = 1350;
        reporter.progress(fileBegin(2));
        now = 1500;
        reporter.progress(fileComplete(2, 120));
        now = 1600;
        await reporter.result({ files: 2, filesWithIssues: new Set(), issues: 0, errors: 0 });

        const summary = lines.join('').split('\n');
        expect(summary).toEqual(
            expect.arrayContaining([
                '  Setup Time      :    100.00ms',
                '  Processing Time :    270.00ms',
                '  Between Files   :     50.00ms',
                '  Other Time      :    180.00ms',
                '  Total Time      :    600.00ms',
            ]),
        );
    });

    test('counts all the time as setup when no file starts', async () => {
        let now = 1000;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        vi.spyOn(console.stderrChannel, 'getColorLevel').mockReturnValue(0);
        const lines: string[] = [];
        vi.spyOn(console.stderrChannel, 'write').mockImplementation((msg) => lines.push(msg));

        const reporter = getReporter({ fileGlobs: ['*'], showPerfSummary: true, summary: true, progress: false });

        now = 1250;
        await reporter.result({ files: 0, filesWithIssues: new Set(), issues: 0, errors: 0 });

        const summary = lines.join('').split('\n');
        expect(summary).toEqual(
            expect.arrayContaining([
                '  Setup Time      :    250.00ms',
                '  Processing Time :      0.00ms',
                '  Between Files   :      0.00ms',
                '  Other Time      :      0.00ms',
                '  Total Time      :    250.00ms',
            ]),
        );
    });
});

function fileBegin(fileNum: number): ProgressFileBegin {
    return { type: 'ProgressFileBegin', fileNum, fileCount: 2, filename: `file${fileNum}.txt` };
}

function fileComplete(fileNum: number, elapsedTimeMs: number): ProgressFileComplete {
    return {
        type: 'ProgressFileComplete',
        fileNum,
        fileCount: 2,
        filename: `file${fileNum}.txt`,
        elapsedTimeMs,
        processed: true,
        numErrors: 0,
    };
}

function genIssue(word: string): ReporterIssue {
    const offset = doc.indexOf(word);
    const text = word;
    const beforeText = doc.slice(0, offset);
    const prevLines = beforeText.split('\n');
    const lines = doc.split('\n');
    const row = prevLines.length;
    const lineText = lines[row - 1];
    const line = { offset: doc.indexOf(lineText), text: lineText };
    const col = offset - line.offset;

    const contextL = Math.max(0, col - 10);
    const contextR = Math.min(lineText.length, col + text.length + 10);
    const context = { offset: line.offset + contextL, text: line.text.slice(contextL, contextR) };

    const issue: ReporterIssue = {
        filename: 'path/filename',
        offset,
        uri: 'file://uri/path/filename',
        context,
        line,
        col,
        row,
        text,
    };

    return issue;
}
