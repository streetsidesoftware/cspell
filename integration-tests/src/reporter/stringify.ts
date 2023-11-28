import { stringify as stringifyYaml } from 'yaml';

import type { Report } from './reportGenerator.js';

export function stringify(report: Report): string {
    const { summary: s, errors, repository } = report;
    const data = {
        Repository: repository?.path,
        Url: repository?.url,
        Args: JSON.stringify(repository?.args || []),
        Summary: {
            files: s.files,
            filesWithIssues: s.filesWithIssues,
            issues: s.issues,
            errors: s.errors,
        },
        Errors: errors,
    };
    const header = stringifyYaml(data, {
        directives: true,
    });

    const issuesData = {
        issues: report.fileIssues,
    };
    const issues = stringifyYaml(issuesData, {
        lineWidth: 200,
        defaultStringType: 'QUOTE_DOUBLE',
        defaultKeyType: 'PLAIN',
        doubleQuotedAsJSON: true,
    });

    const issuesSummary = report.issuesSummary?.length
        ? stringifyYaml(
              {
                  issuesSummary: report.issuesSummary.map((issue) =>
                      stringifyYaml(issue).replace(/\n/g, ', ').replace(/\s+/g, ' ').trim(),
                  ),
              },
              { lineWidth: 200 },
          )
        : '';

    return [header, issues, issuesSummary].filter((a) => !!a).join('\n');
}
