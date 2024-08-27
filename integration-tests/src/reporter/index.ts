import { promises as fs } from 'node:fs';

import type { CSpellReporter, Issue, ReporterConfiguration, RunResult } from '@cspell/cspell-types';
import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import * as vscodeUri from 'vscode-uri';

import { readConfig } from '../config.js';
import type { Repository } from '../configDef.js';
import { writeSnapshotRaw } from '../snapshots.js';
import type { IssueSummary, ReportData } from './reportGenerator.js';
import { generateReport } from './reportGenerator.js';
import { stringify } from './stringify.js';

const { URI, Utils: UriUtils } = vscodeUri;

const noopReporter = () => {
    return;
};

interface CsvRecord {
    timestamp: string;
    elapsedMs: number;
    repo: string;
    /** number of files processed */
    files: number;
    filesWithIssues: number;
    issues: number;
    errors: number;
    platform: string;
    usageUser: number;
    usageSystem: number;
    /** number of kilobytes processed */
    kilobytes: number;
}
const csvHeaders = [
    'timestamp',
    'repo',
    'elapsedMs',
    'files',
    'filesWithIssues',
    'issues',
    'errors',
    'platform',
    'usageUser',
    'usageSystem',
    'kilobytes',
] as const;

const reformatCsv = false;

interface Config extends ReporterConfiguration {
    issuesSummaryReport?: boolean;
}

interface ReporterSettings {
    listAllFiles?: boolean;
}

export function getReporter(_settings: unknown, config?: Config): CSpellReporter {
    const settings = toReporterSettings(_settings);
    const { listAllFiles = false } = settings;
    const issueFilter = config?.unique ? uniqueFilter((i: Issue) => i.text) : () => true;
    const issues: Issue[] = [];
    const errors: string[] = [];
    const files = new Set<string>();
    const issuesSummaryReport = !!config?.issuesSummaryReport;
    const issuesSummary = new Map<string, IssueSummary>();
    const summaryAccumulator = createIssuesSummaryAccumulator(issuesSummary);
    const createTs = performance.now();
    const startUsage = process.cpuUsage();

    async function processResult(result: RunResult): Promise<void> {
        const root = URI.file(process.cwd());
        const elapsedMs = performance.now() - createTs;
        const usage = process.cpuUsage(startUsage);
        const reportData: ReportData = {
            issues,
            files: [...files],
            errors,
            runResult: result,
            root,
            repository: fetchRepositoryInfo(root),
            issuesSummary: issuesSummaryReport && issuesSummary.size ? [...issuesSummary.values()] : undefined,
        };
        const report = generateReport(reportData, { listAllFiles });
        const repPath = extractRepositoryPath(root);
        writeSnapshotRaw(repPath, 'report.yaml', stringify(report));
        const csvRecord: CsvRecord = {
            timestamp: Date.now().toFixed(0),
            elapsedMs,
            repo: repPath,
            files: result.files,
            filesWithIssues: result.filesWithIssues.size,
            issues: result.issues,
            errors: result.errors,
            platform: process.platform,
            usageUser: usage.user / 1000,
            usageSystem: usage.system / 1000,
            kilobytes: await getFileSizes([...files]),
        };
        await writePerfCsvRecord(csvRecord, root);
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
        progress: (p) => files.add(p.filename),
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

function getPerfCsvFileUrl(root: vscodeUri.URI): URL {
    const repPath = extractRepositoryPath(root).replaceAll('/', '__');
    return new URL(`../../perf/perf-run-${repPath}.csv`, import.meta.url);
}

/**
 * Create the CSV file if necessary and ensure that the column headers are present.
 * It will reformat the file if the headers to not match.
 */
async function createCsvFile(csvUrl: URL): Promise<void> {
    if (!reformatCsv) return;
    const csvFile = await fs.readFile(csvUrl, 'utf8').catch(() => undefined);
    if (!csvFile) {
        return fs.writeFile(csvUrl, stringifyCsv([csvHeaders]));
    }
    const records: Partial<CsvRecord>[] = parseCsv(csvFile, { columns: true, skip_empty_lines: true });
    if (!records.length) {
        return fs.writeFile(csvUrl, stringifyCsv([csvHeaders]));
    }
    const firstRecord = records[0];
    const headers = Object.keys(firstRecord);
    if (headers.join('}{') === csvHeaders.join('}{')) {
        // The headers match, nothing to do.
        return;
    }
    // Need to reformat the file.
    return fs.writeFile(csvUrl, stringifyCsv(records, { header: true, columns: [...csvHeaders] }));
}

function extractFieldFromCsv(csvRecord: CsvRecord, field: keyof CsvRecord): number | string | undefined {
    if (field === 'elapsedMs') return csvRecord[field].toFixed(2);
    return csvRecord[field];
}

async function writePerfCsvRecord(csvRecord: CsvRecord, root: vscodeUri.URI): Promise<void> {
    const url = getPerfCsvFileUrl(root);

    await createCsvFile(url);

    const record = csvHeaders.map((key) => extractFieldFromCsv(csvRecord, key));
    await fs.appendFile(url, stringifyCsv([record]));
}

/**
 *
 * @param files - list of files to get the size of
 * @returns total size of all files in kilobytes.
 */
async function getFileSizes(files: string[]): Promise<number> {
    let total = 0;

    for (const file of files) {
        try {
            const stat = await fs.stat(file);
            total += stat.size;
        } catch {
            // ignore
        }
    }

    return Math.ceil(total / 1024);
}

function toReporterSettings(settings: unknown): ReporterSettings {
    if (!isReporterSettings(settings)) {
        return {};
    }
    return settings;
}

function isReporterSettings(settings: unknown): settings is ReporterSettings {
    return typeof settings === 'object' && settings !== null && !Array.isArray(settings);
}

export function getReporterListAll(_settings: unknown, config?: Config): CSpellReporter {
    return getReporter({ listAllFiles: true }, config);
}
