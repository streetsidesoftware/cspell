import type { ReporterIssue } from './cli-reporter';
import { __testing__ } from './cli-reporter';

const { formatIssue } = __testing__;

const doc = `
This is a simple document with a bit of text.

It has more than one line.

$myPhpOffset := $row + $col;

$uri:$filename:$row:$col$padRowCol,$message,$text,$padContext,$contextLeft,$text,$contextRight,[$suggestions]

And some words to be used for some spelling issues.

There are many options.
`;

describe('cli-reporter', () => {
    test.each`
        issue                  | template                                             | expected
        ${genIssue('line')}    | ${''}                                                | ${''}
        ${genIssue('line')}    | ${'$row:$col:$text'}                                 | ${'4:21:line'}
        ${genIssue('$col')}    | ${'$row:$col:$text'}                                 | ${'6:23:$col'}
        ${genIssue('$col')}    | ${'$row:$col:$text - $contextFull'}                  | ${'6:23:$col - := $row + $col;'}
        ${genIssue('message')} | ${'$row:$col:$text - $contextFull'}                  | ${'8:36:message - adRowCol,$message,$text,$pa'}
        ${genIssue('used')}    | ${'$contextLeft:$text:$contextRight - $contextFull'} | ${'rds to be :used: for some  - rds to be used for some '}
    `('formatIssue', ({ issue, template, expected }) => {
        expect(formatIssue(template, issue, 200)).toBe(expected);
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
