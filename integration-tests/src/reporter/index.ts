import type { CSpellReporter, Issue, RunResult } from '@cspell/cspell-types';
import { URI, Utils as UriUtils } from 'vscode-uri';
import { generateReport } from './reportGenerator';
import { stringify } from './stringify';
import { readConfig } from '../config';
import type { Repository } from '../configDef';
import { writeSnapshotRaw } from '../snapshots';

const noopReporter = () => {
    return;
};

export function getReporter(): CSpellReporter {
    const issues: Issue[] = [];
    const errors: string[] = [];
    const files: string[] = [];

    async function processResult(result: RunResult): Promise<void> {
        const root = URI.file(process.cwd());
        const report = generateReport({
            issues,
            files,
            errors,
            runResult: result,
            root,
            repository: fetchRepositoryInfo(root),
        });
        const repPath = extractRepositoryPath(root);
        writeSnapshotRaw(repPath, 'report.yaml', stringify(report));
    }

    const reporter: CSpellReporter = {
        issue: (issue) => {
            issues.push(issue);
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

function extractRepositoryPath(root: URI): string {
    const b = UriUtils.basename(root);
    const a = UriUtils.basename(UriUtils.dirname(root));
    return [a, b].join('/');
}

function fetchRepositoryInfo(root: URI): Repository | undefined {
    const config = readConfig();
    const reps = new Map(config.repositories.map((r) => [r.path, r]));
    const path = extractRepositoryPath(root);
    return reps.get(path);
}
