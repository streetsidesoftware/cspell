import type { CSpellReporter, Issue, ReporterConfiguration, RunResult } from '@cspell/cspell-types';
import * as vscodeUri from 'vscode-uri';

import { readConfig } from '../config.js';
import type { Repository } from '../configDef.js';
import { writeSnapshotRaw } from '../snapshots.js';
import type { IssueSummary } from './reportGenerator.js';
import { generateReport } from './reportGenerator.js';
import { stringify } from './stringify.js';

const { URI, Utils: UriUtils } = vscodeUri;

const noopReporter = () => {
    return;
};

interface Config extends ReporterConfiguration {
    issuesSummaryReport?: boolean;
}

export function getReporter(_settings: unknown, config?: Config): CSpellReporter {
    const issueFilter = config?.unique ? uniqueFilter((i: Issue) => i.text) : () => true;
    const issues: Issue[] = [];
    const errors: string[] = [];
    const files: string[] = [];
    const issuesSummaryReport = !!config?.issuesSummaryReport;
    const issuesSummary = new Map<string, IssueSummary>();
    const summaryAccumulator = createIssuesSummaryAccumulator(issuesSummary);

    async function processResult(result: RunResult): Promise<void> {
        const root = URI.file(process.cwd());
        const report = generateReport({
            issues,
            files,
            errors,
            runResult: result,
            root,
            repository: fetchRepositoryInfo(root),
            issuesSummary: issuesSummaryReport && issuesSummary.size ? [...issuesSummary.values()] : undefined,
        });
        const repPath = extractRepositoryPath(root);
        writeSnapshotRaw(repPath, 'report.yaml', stringify(report));
    }

    const reporter: CSpellReporter = {
        issue: (issue) => {
            summaryAccumulator(issue);
            if (issueFilter(issue)) {
                issues.push(issue);
            }
        },
        info: noopReporter,
        debug: noopReporter,
        error: (message, _error) => {
            errors.push(message);
        },
        progress: (p) => files.push(p.filename),
        result: processResult,
    };

    return reporter;
}

function extractRepositoryPath(root: vscodeUri.URI): string {
    const b = UriUtils.basename(root);
    const a = UriUtils.basename(UriUtils.dirname(root));
    return [a, b].join('/');
}

function fetchRepositoryInfo(root: vscodeUri.URI): Repository | undefined {
    const config = readConfig();
    const reps = new Map(config.repositories.map((r) => [r.path, r]));
    const path = extractRepositoryPath(root);
    return reps.get(path);
}

function uniqueFilter<T, K>(keyFn: (v: T) => K): (v: T) => boolean {
    const seen = new Set<K>();
    return (v) => {
        const k = keyFn(v);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    };
}

function createIssuesSummaryAccumulator(issuesSummary: Map<string, IssueSummary>): (issue: Issue) => void {
    function uniqueKey(issue: Issue): string {
        return [issue.text, issue.uri || ''].join('::');
    }

    const isUnique = uniqueFilter(uniqueKey);

    return (issue: Issue) => {
        const { text } = issue;
        const summary = issuesSummary.get(text) || { text, count: 0, files: 0 };
        const unique = isUnique(issue);
        summary.count += 1;
        summary.files += unique ? 1 : 0;
        if (issue.isFlagged) {
            summary.isFlagged = true;
        }
        issuesSummary.set(text, summary);
    };
}
