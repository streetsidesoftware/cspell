import type { Report } from './reportGenerator';

export function stringify(report: Report): string {
    return header(report) + 'issues: ' + toYamlArray(report.fileIssues, '  ');
}

function header(report: Report): string {
    const { summary: s, errors, repository } = report;
    const h = `---
Repository: ${repository?.path}
Url: ${repository?.url}
Args: ${JSON.stringify(repository?.args || [])}
Summary:
  files: ${s.files}
  filesWithIssues: ${s.filesWithIssues}
  issues: ${s.issues}
  errors: ${s.errors}
Errors: ${toYamlArray(errors, '  ')}
`;
    return h;
}

function toYamlArray(lines: string[], indent: string): string {
    if (!lines.length) return '[]\n';
    const escapedLines = lines.map((a) => JSON.stringify(a)).map((a) => a.replace(/(?<!\\)\\t/g, '\t'));
    const pfx = '\n' + indent + '- ';
    return pfx + escapedLines.join(pfx) + '\n';
}
