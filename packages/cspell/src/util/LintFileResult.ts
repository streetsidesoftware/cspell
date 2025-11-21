import { Issue, ReportIssueOptions } from '@cspell/cspell-types';

import { FileInfo, Perf } from './fileHelper.js';

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
