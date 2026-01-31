import type { ReportIssueOptions } from '@cspell/cspell-types';

import type { LintFileResult } from '../reporters/LintFileResult.js';
import type { ReadFileInfoResult } from '../util/fileHelper.js';

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

export interface FileToProcess {
    /**
     * The full path to the file being processed.
     */
    filename: string;
    /**
     * A sequence number to help with ordering the results.
     * Starts with 0 and goes up to `sequenceSize - 1`.
     */
    sequence: number;

    /**
     * The number of files being processed. `undefined` if unknown.
     */
    sequenceSize?: number | undefined;
}

export interface PrefetchFileResult extends FileToProcess {
    result?: Promise<PFCached | PFFile | PFSkipped | Error>;
}

export interface ProcessPrefetchFileResult extends FileToProcess {
    result: LintFileResult;
}
