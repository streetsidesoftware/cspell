import type { Issue, RunResult } from '@cspell/cspell-types';
import type { URI as Uri } from 'vscode-uri';

import type { Repository } from '../configDef.js';

export type Report = {
    fileIssues: SortedFileIssues;
    errors: string[];
    summary: Summary;
    repository: Repository | undefined;
    issuesSummary: IssueSummary[];
};

export interface Summary {
    files: number;
    filesWithIssues: number;
    issues: number;
    errors: number;
}

export interface IssueSummary {
    text: string;
    isFlagged?: boolean | undefined;
    count: number;
    files: number;
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
    issuesSummary?: IssueSummary[] | undefined;
}

const compare = new Intl.Collator().compare;

export function generateReport(data: ReportData): Report {
    const { errors, runResult, issues, root } = data;
    const rootUri = root.toString();
    const byFile = new Map<string, Issue[]>();
    function relative(uri: string) {
        if (uri.startsWith(rootUri)) {
            const r = uri.slice(rootUri.length);
            return decodeURIComponent(r.startsWith('/') ? r.slice(1) : r);
        }
        return decodeURIComponent(uri);
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
        return padLines(issues.map((issue) => formatIssue(file, issue)));
    });

    const base: SortedFileIssues = [];
    const fileIssues: SortedFileIssues = base.concat(...issuesByFile);
    const issuesSummary = [...(data.issuesSummary || [])].sort((a, b) => compare(a.text, b.text));

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
        issuesSummary,
    };
}

function formatIssue(file: string, issue: Issue): string {
    const { row, col, isFlagged, text, context, suggestionsEx } = issue;
    const suggestions =
        suggestionsEx &&
        suggestionsEx
            .filter((s) => s.isPreferred)
            .map((s) => s.wordAdjustedToMatchCase || s.word)
            .filter((s) => !!s)
            .join(', ');
    const fix = suggestions ? ` (${suggestions})` : '';
    const issueType = isFlagged ? 'F' : 'U';
    const ctx = context.text
        .replace(/\s+/g, ' ')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F]+/g, '') // remove control characters
        .trim();
    const line = `${file}:${row}:${col}\t${text}${fix}\t${issueType}\t${ctx}`;
    return line.trim();
}

const tabWidth = 4;

function padLines(issueLines: string[]): string[] {
    const splitLines = issueLines.map((a) => a.split('\t'));
    const widths = splitLines
        .map((line) => [calcPathWidth(line[0]), ...line.slice(1).map((s) => s.length)])
        .reduce(maxMax, [0, 0, 0, 0]);

    const paddedWidths = widths.map((w) => Math.ceil(w / tabWidth) * tabWidth);

    const lines = splitLines
        .map((lineCols) => lineCols.map((t, i) => padText(t, paddedWidths[i])))
        .map((parts) => tabToSpace(parts.join('\t').trim()));
    return lines;
}

function padText(t: string, width: number) {
    const p = ' '.repeat(width - t.length);
    return t + p;
}

function maxMax(a: number[], b: number[]): number[] {
    const r: number[] = [];
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; ++i) {
        r[i] = Math.max(a[i] || 0, b[i] || 0);
    }
    return r;
}

function calcPathWidth(path: string): number {
    const parts = path.split(/:(?=\d)/g).map((s) => s.length);
    parts[1] = Math.max(parts[1] || 0, 4);
    parts[2] = Math.max(parts[2] || 0, 3);
    return parts.reduce((a, b) => a + b, parts.length - 1);
}

function tabToSpace(text: string, tabWidth = 4): string {
    const parts = text.split('\t');
    let result = parts[0];

    for (let i = 1; i < parts.length; ++i) {
        const pad = ' '.repeat(tabWidth - (result.length % tabWidth));
        result += pad + parts[i];
    }

    return result;
}

export const __testing__ = {
    padLines,
};
