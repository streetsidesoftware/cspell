import { Issue, RunResult } from '@cspell/cspell-types';
import { URI as Uri } from 'vscode-uri';
import { Repository } from '../configDef';

export type Report = {
    fileIssues: SortedFileIssues;
    errors: string[];
    summary: Summary;
    repository: Repository | undefined;
};

export interface Summary {
    files: number;
    filesWithIssues: number;
    issues: number;
    errors: number;
}

type SortedFileIssues = FileIssue[];
type FileIssue = string;

export interface ReportData {
    errors: string[];
    files: string[];
    issues: Issue[];
    root: Uri;
    runResult: RunResult;
    repository: Repository | undefined;
}

const compare = new Intl.Collator().compare;

export function generateReport(data: ReportData): Report {
    const { errors, runResult, issues, root } = data;
    const rootUri = root.toString();
    const byFile = new Map<string, Issue[]>();
    function relative(uri: string) {
        if (uri.startsWith(rootUri)) {
            const r = uri.slice(rootUri.length);
            return r.startsWith('/') ? r.slice(1) : r;
        }
        return uri;
    }
    issues.forEach((issue) => {
        const uri = issue.uri || '';
        const found = byFile.get(uri);
        const issues = found || [];
        if (!found) {
            byFile.set(uri, issues);
        }
        issues.push(issue);
    });

    const sortedByFile = [...byFile].sort((a, b) => compare(a[0], b[0]));

    const issuesByFile = sortedByFile.map(([uri, issues]) => {
        const file = relative(uri);
        return issues.map((issue) => formatIssue(file, issue));
    });

    const base: SortedFileIssues = [];
    const fileIssues: SortedFileIssues = base.concat(...issuesByFile);

    return {
        fileIssues,
        errors,
        summary: {
            files: runResult.files,
            filesWithIssues: runResult.filesWithIssues.size,
            issues: runResult.issues,
            errors: runResult.errors,
        },
        repository: data.repository,
    };
}

function formatIssue(file: string, issue: Issue): string {
    const { row, col, isFlagged, text, context } = issue;
    const issueType = isFlagged ? 'F' : 'U';
    const ctx = context.text.replace(/\s+/g, ' ').trim();
    const line = `${file}:${row}:${col}\t${text}\t${issueType}\t${ctx}`;
    return line.trim();
}
