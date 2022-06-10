import type { TokenizedLine } from '../parser';
import { toInlineCode } from './markdownHelper';

export function _tokenizedLineToMarkdown(line: TokenizedLine, indentation = ''): string {
    const markdownLines: string[] = [];

    const header = `- \`${line.line.lineNumber + 1}\`: ${toInlineCode(line.line.text)}

  | text      | scope                                                    |
  | --------- | -------------------------------------------------------- |`;

    markdownLines.push(...header.split('\n'));
    markdownLines.push(...line.tokens.map((t) => `  | ${toInlineCode(t.text)} | ${t.scope} |`));

    return markdownLines.map((line) => indentation + line).join('\n') + '\n\n';
}

export function tokenizedLineToMarkdown(line: TokenizedLine, indentation = ''): string {
    const rows = line.tokens.map((t) => `| ${toInlineCode(t.text)} | ${t.scope} |`);

    const detail = `<details>
<summary><code>${line.line.lineNumber + 1}</code>: ${toInlineCode(line.line.text)}</summary>

| text      | scope                                                    |
| --------- | -------------------------------------------------------- |
${rows.join('\n')}

</details>
`;

    const markdownLines = detail.split('\n');

    return (
        markdownLines
            .map((line) => indentation + line)
            .map((line) => (line.trim() === '' ? '' : line))
            .join('\n') + '\n\n'
    );
}

export function tokenizedLinesToMarkdown(lines: TokenizedLine[], indentation = ''): string {
    return lines.map((line) => tokenizedLineToMarkdown(line, indentation)).join('');
}
