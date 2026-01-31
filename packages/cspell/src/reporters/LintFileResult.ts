import type { CSpellReporter, Issue, ReportIssueOptions } from '@cspell/cspell-types';

import type { FileInfo, Perf } from '../util/fileHelper.js';

export type FinalizedReporter = Required<CSpellReporter>;

export type IssuePayload = { issue: Issue; reportOptions?: ReportIssueOptions | undefined };
export type InfoPayload = Parameters<FinalizedReporter['info']>;
export type DebugPayload = Parameters<FinalizedReporter['debug']>;
export type ErrorPayload = Parameters<FinalizedReporter['error']>;

export interface IssueReportItem {
    type: 'issue';
    payload: IssuePayload;
}

export interface InfoReportItem {
    type: 'info';
    payload: InfoPayload;
}

export interface DebugReportItem {
    type: 'debug';
    payload: DebugPayload;
}

export interface ErrorReportItem {
    type: 'error';
    payload: ErrorPayload;
}

export type ReportItem = InfoReportItem | DebugReportItem | ErrorReportItem;

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
    reportItems?: ReportItem[] | undefined;
}

export interface ProcessFileReporter {
    info(...params: Parameters<FinalizedReporter['info']>): void;
    debug(...params: Parameters<FinalizedReporter['debug']>): void;
    error(...params: Parameters<FinalizedReporter['error']>): void;
}

export interface LintFileReporter extends ProcessFileReporter {
    issue(issue: Issue, reportOptions?: ReportIssueOptions): void;
    emitProgressBegin(filename: string, fileNum: number, fileCount: number): void;
    emitProgressComplete(filename: string, fileNum: number, fileCount: number, result: LintFileResult): number;
}

export interface ReportItemsCollection {
    reportItems?: ReportItem[] | undefined;
}
