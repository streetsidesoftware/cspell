import { Chalk } from 'chalk';
import { describe, expect, test } from 'vitest';

import { ApplicationError } from './app.mjs';
import type { ReporterIssue } from './cli-reporter.js';
import { __testing__, checkTemplate } from './cli-reporter.js';

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
