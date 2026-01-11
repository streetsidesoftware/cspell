import type { ReportIssueOptions } from '@cspell/cspell-types';

import type { ReadFileInfoResult } from '../util/fileHelper.js';
import type { LintFileResult } from '../util/LintFileResult.js';

export interface PrefetchResult {
    fileResult?: LintFileResult | undefined;
    fileInfo?: ReadFileInfoResult | undefined;
    skip?: boolean | undefined;
    skipReason?: string | undefined;
    reportIssueOptions?: ReportIssueOptions | undefined;
}

export interface PFCached extends PrefetchResult {
    fileResult: LintFileResult;
    fileInfo?: undefined;
    skipReason?: undefined;
    skip?: undefined;
}

export interface PFFile extends PrefetchResult {
    fileResult?: undefined;
    fileInfo: ReadFileInfoResult;
    skip?: undefined;
    skipReason?: undefined;
    reportIssueOptions: ReportIssueOptions | undefined;
}

export interface PFSkipped extends PrefetchResult {
    fileResult?: undefined;
    fileInfo?: undefined;
    skip: true;
    skipReason?: string | undefined;
    reportIssueOptions?: undefined;
}

export interface PrefetchFileResult {
    filename: string;
    result?: Promise<PFCached | PFFile | PFSkipped | Error>;
}
