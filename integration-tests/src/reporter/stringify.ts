import { stringify as stringifyYaml } from 'yaml';

import type { Report } from './reportGenerator';

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
    return [header, issues].join('\n');
}
