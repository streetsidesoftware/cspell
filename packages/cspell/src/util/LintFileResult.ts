import type { Issue, ReportIssueOptions } from '@cspell/cspell-types';

import type { FileInfo, Perf } from './fileHelper.js';

export interface LintFileResult {
    fileInfo: FileInfo;
    processed: boolean;
    skippedReason?: string | undefined;
    issues: Issue[];
    errors: number;
    configErrors: number;
    elapsedTimeMs: number | undefined;
    perf?: Perf | undefined;
    cached?: boolean;
    reportIssueOptions?: ReportIssueOptions | undefined;
}
